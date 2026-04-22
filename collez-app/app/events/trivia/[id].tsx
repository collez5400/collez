import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { EmptyState } from '../../../src/components/shared/EmptyState';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { XP_VALUES } from '../../../src/config/constants';
import { Colors, Spacing, Typography } from '../../../src/config/theme';
import type { Event, TriviaQuestion } from '../../../src/models/event';
import { useEventStore } from '../../../src/store/eventStore';
import { useXpStore } from '../../../src/store/xpStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Status = 'playing' | 'feedback' | 'results';

export default function TriviaEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { liveEvents, upcomingEvents, pastEvents, fetchEvents, joinEvent, submitTriviaAnswer, submitTriviaResult } = useEventStore();
  const { awardXpForAction } = useXpStore();

  const [status, setStatus] = useState<Status>('playing');
  const [event, setEvent] = useState<Event | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awardedXp, setAwardedXp] = useState(0);
  const [passed, setPassed] = useState(false);

  const progress = useSharedValue(1);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  const triviaQuestions = useMemo<TriviaQuestion[]>(() => {
    if (!event?.config || !Array.isArray(event.config.questions)) return [];
    return event.config.questions;
  }, [event]);

  const currentQuestion = triviaQuestions[questionIndex];
  const totalQuestions = triviaQuestions.length;
  const timePerQuestion = currentQuestion?.time_limit_seconds ?? 15;

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  useEffect(() => {
    const hydrate = async () => {
      await fetchEvents();
      const list = [...liveEvents, ...upcomingEvents, ...pastEvents];
      const found = list.find((item) => item.id === id) ?? null;
      setEvent(found);
      if (found) {
        await joinEvent(found.id);
      }
    };
    void hydrate();
  }, [fetchEvents, id, joinEvent, liveEvents, pastEvents, upcomingEvents]);

  useEffect(() => {
    if (!currentQuestion || status !== 'playing') return;
    progress.value = 1;
    progress.value = withTiming(0, { duration: timePerQuestion * 1000 });

    const timer = setTimeout(() => {
      void handleAnswer(-1);
    }, timePerQuestion * 1000);
    return () => clearTimeout(timer);
  }, [currentQuestion, progress, questionIndex, status, timePerQuestion]);

  const handleAnswer = async (optionIndex: number) => {
    if (!currentQuestion || status !== 'playing') return;
    const correct = optionIndex === currentQuestion.correct_index;
    if (correct) setScore((prev) => prev + 1);
    setSelectedOption(optionIndex);
    setIsCorrect(correct);
    setStatus('feedback');
    if (event) {
      void submitTriviaAnswer({
        eventId: event.id,
        questionId: currentQuestion.id,
        selectedIndex: optionIndex,
        isCorrect: correct,
      });
    }

    setTimeout(() => {
      if (questionIndex + 1 < totalQuestions) {
        setQuestionIndex((prev) => prev + 1);
        setSelectedOption(null);
        setStatus('playing');
        return;
      }
      setStatus('results');
    }, 700);
  };

  const handleSubmitResults = async () => {
    if (!event || totalQuestions === 0) return;
    setIsSubmitting(true);

    const storeResult = await submitTriviaResult({
      event,
      score,
      totalQuestions,
    });

    const fallbackXp = score * XP_VALUES.TRIVIA_CORRECT + 5;
    const xpToAward = storeResult?.xpAwarded ?? fallbackXp;
    const xpResult = await awardXpForAction({
      source: 'trivia',
      amount: xpToAward,
      sourceId: event.id,
      description: `Trivia reward: ${event.title}`,
    });
    setAwardedXp(xpResult?.awardedXp ?? xpToAward);
    setPassed(Boolean(storeResult?.passed));
    setIsSubmitting(false);
  };

  if (!event) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!currentQuestion && status !== 'results') {
    return (
      <View style={styles.screen}>
        <EmptyState icon="quiz" title="No trivia questions configured" description="Add questions in admin event creator." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{event.title}</Text>

      {status !== 'results' ? (
        <>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              Question {questionIndex + 1}/{totalQuestions}
            </Text>
            <Svg width={86} height={86}>
              <Circle cx="43" cy="43" r={radius} stroke={`${Colors.outline}44`} strokeWidth={8} fill="none" />
              <AnimatedCircle
                cx="43"
                cy="43"
                r={radius}
                stroke={Colors.primary}
                strokeWidth={8}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                animatedProps={animatedCircleProps}
                strokeLinecap="round"
                rotation="-90"
                origin="43,43"
              />
            </Svg>
          </View>

          <GlassCard style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion?.text}</Text>
          </GlassCard>

          <View style={styles.optionsWrap}>
            {(currentQuestion?.options ?? []).map((option, index) => {
              const isSelected = selectedOption === index;
              const isAnswerCorrect = status === 'feedback' && index === currentQuestion?.correct_index;
              return (
                <Pressable
                  key={`${currentQuestion?.id}-${index}`}
                  onPress={() => void handleAnswer(index)}
                  disabled={status !== 'playing'}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionSelected,
                    isAnswerCorrect && styles.optionCorrect,
                  ]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          {status === 'feedback' ? (
            <Text style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
              {isCorrect ? 'Correct answer!' : 'Wrong answer'}
            </Text>
          ) : null}
        </>
      ) : (
        <GlassCard style={styles.resultCard}>
          <Text style={styles.resultTitle}>Trivia Complete</Text>
          <Text style={styles.resultScore}>
            Score: {score}/{totalQuestions}
          </Text>
          <Text style={styles.resultMeta}>XP earned: {awardedXp}</Text>
          <Text style={styles.resultMeta}>{passed ? 'Badge unlocked' : 'Try again for badge'}</Text>

          {!awardedXp ? (
            <GradientButton title={isSubmitting ? 'Submitting...' : 'Claim XP'} onPress={() => void handleSubmitResults()} />
          ) : null}
          <GradientButton title="Back to Events" onPress={() => router.replace('/events')} />
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  questionCard: { minHeight: 120, justifyContent: 'center' },
  questionText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.md,
    lineHeight: 24,
  },
  optionsWrap: { gap: Spacing.sm },
  optionCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceLow,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}22` },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.18)' },
  optionText: { color: Colors.onSurface, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '600' },
  feedback: { textAlign: 'center', fontFamily: Typography.fontFamily.heading, fontWeight: '700', fontSize: Typography.size.md },
  feedbackCorrect: { color: '#22c55e' },
  feedbackWrong: { color: Colors.error },
  resultCard: { gap: Spacing.sm },
  resultTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.lg,
  },
  resultScore: { color: Colors.primary, fontFamily: Typography.fontFamily.heading, fontWeight: '700', fontSize: Typography.size.md },
  resultMeta: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
});
