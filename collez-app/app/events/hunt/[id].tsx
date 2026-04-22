import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MathPuzzle } from '../../../src/components/events/MathPuzzle';
import { SudokuGrid } from '../../../src/components/events/SudokuGrid';
import { WordScramble } from '../../../src/components/events/WordScramble';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { XP_VALUES } from '../../../src/config/constants';
import { Colors, Spacing, Typography } from '../../../src/config/theme';
import type { Event, HuntClue, TreasureHuntConfig } from '../../../src/models/event';
import { useEventStore } from '../../../src/store/eventStore';
import { useXpStore } from '../../../src/store/xpStore';

function getTreasureHuntConfig(event: Event | null): TreasureHuntConfig | null {
  if (!event?.config || typeof event.config !== 'object') return null;
  if (!Array.isArray((event.config as TreasureHuntConfig).clues)) return null;
  return event.config as TreasureHuntConfig;
}

export default function TreasureHuntScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { liveEvents, upcomingEvents, pastEvents, fetchEvents, joinEvent, getParticipation, submitHuntResponse } = useEventStore();
  const { awardXpForAction } = useXpStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionXp, setCompletionXp] = useState(0);

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      await fetchEvents();
      const found = [...liveEvents, ...upcomingEvents, ...pastEvents].find((item) => item.id === id) ?? null;
      setEvent(found);
      if (found) {
        const participation = await joinEvent(found.id);
        setIsCompleted(Boolean(participation?.completed));
      }
      setIsLoading(false);
    };
    void hydrate();
  }, [fetchEvents, id, joinEvent, liveEvents, pastEvents, upcomingEvents]);

  const config = useMemo(() => getTreasureHuntConfig(event), [event]);
  const clues = config?.clues ?? [];

  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const currentClue = clues[currentClueIndex] ?? null;

  useEffect(() => {
    const loadProgress = async () => {
      if (!event) return;
      const participation = await getParticipation(event.id);
      const progress = (participation?.progress ?? {}) as { currentClueIndex?: number };
      if (typeof progress.currentClueIndex === 'number') {
        setCurrentClueIndex(Math.min(progress.currentClueIndex, Math.max(clues.length - 1, 0)));
      }
      setIsCompleted(Boolean(participation?.completed));
    };
    void loadProgress();
  }, [clues.length, event, getParticipation]);

  const submitCurrentClue = async () => {
    if (!event || !currentClue || !answer.trim()) return;
    setIsSubmitting(true);
    const result = await submitHuntResponse({
      eventId: event.id,
      clueId: currentClue.id,
      response: answer.trim(),
    });
    setIsSubmitting(false);
    if (!result) return;

    setFeedback(result.message);
    if (result.solved) setAnswer('');
    if (result.completed) {
      const reward = config?.completion_xp ?? event.xp_reward ?? XP_VALUES.TREASURE_HUNT;
      const xpResult = await awardXpForAction({
        source: 'treasure_hunt',
        amount: reward,
        sourceId: event.id,
        description: `Treasure hunt reward: ${event.title}`,
      });
      setCompletionXp(xpResult?.awardedXp ?? reward);
      setIsCompleted(true);
    } else {
      setCurrentClueIndex(result.currentClueIndex);
    }
  };

  const renderPuzzleInput = (clue: HuntClue) => {
    const puzzleData = clue.puzzle_data ?? {};
    if (clue.puzzle_type === 'word_scramble') {
      return (
        <WordScramble
          value={answer}
          onChange={setAnswer}
          scrambledWord={typeof puzzleData.scrambled === 'string' ? puzzleData.scrambled : undefined}
        />
      );
    }
    if (clue.puzzle_type === 'math') {
      return (
        <MathPuzzle
          value={answer}
          onChange={setAnswer}
          equation={typeof puzzleData.equation === 'string' ? puzzleData.equation : undefined}
        />
      );
    }
    return (
      <SudokuGrid
        value={answer}
        onChange={setAnswer}
        prompt={typeof clue.hint === 'string' ? clue.hint : undefined}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!event || event.event_type !== 'treasure_hunt' || !config) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Treasure hunt is not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.subtitle}>{event.description ?? 'Solve clues and unlock rewards.'}</Text>

      <View style={styles.dotRow}>
        {clues.map((clue, index) => {
          const done = index < currentClueIndex || isCompleted;
          const active = index === currentClueIndex && !isCompleted;
          return <View key={clue.id} style={[styles.dot, done && styles.dotDone, active && styles.dotActive]} />;
        })}
      </View>

      {isCompleted ? (
        <Animated.View entering={FadeInDown.duration(450)}>
          <GlassCard style={styles.completeCard}>
            <Text style={styles.completeTitle}>Treasure Hunt Completed</Text>
            <Text style={styles.completeText}>You solved every clue.</Text>
            <Text style={styles.completeXp}>XP earned: {completionXp || config.completion_xp || event.xp_reward}</Text>
            <GradientButton title="Back to Events" onPress={() => router.replace('/events')} />
          </GlassCard>
        </Animated.View>
      ) : currentClue ? (
        <GlassCard style={styles.clueCard}>
          <Text style={styles.clueStep}>Clue {Math.min(currentClueIndex + 1, clues.length)}/{clues.length}</Text>
          <Text style={styles.clueType}>{currentClue.type.toUpperCase()}</Text>
          <Text style={styles.clueHint}>{currentClue.hint ?? 'Solve this clue to unlock the next step.'}</Text>

          {currentClue.type === 'navigate' ? (
            <Text style={styles.navigationText}>
              Go to <Text style={styles.navigationValue}>{currentClue.target_screen ?? 'target screen'}</Text> and interact with{' '}
              <Text style={styles.navigationValue}>{currentClue.hidden_element_id ?? 'the hidden element'}</Text>.
            </Text>
          ) : null}

          {currentClue.type === 'question' && currentClue.question ? <Text style={styles.questionText}>{currentClue.question}</Text> : null}

          {currentClue.type === 'puzzle' ? (
            renderPuzzleInput(currentClue)
          ) : (
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              style={styles.answerInput}
              placeholder="Type your answer"
              autoCapitalize="none"
              placeholderTextColor={Colors.onSurfaceVariant}
            />
          )}

          <GradientButton
            title={isSubmitting ? 'Submitting...' : 'Submit'}
            onPress={() => void submitCurrentClue()}
            disabled={isSubmitting || !answer.trim()}
          />
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

          <Pressable onPress={() => router.replace('/events')}>
            <Text style={styles.backText}>Back to events</Text>
          </Pressable>
        </GlassCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.lg },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xl },
  title: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, fontWeight: '700' },
  subtitle: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  dotRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: `${Colors.outline}55` },
  dotDone: { backgroundColor: '#22c55e' },
  dotActive: { backgroundColor: Colors.primary },
  clueCard: { gap: Spacing.sm },
  clueStep: { color: Colors.primary, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '700' },
  clueType: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  clueHint: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  questionText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
    lineHeight: 22,
  },
  navigationText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  navigationValue: { color: Colors.primary, fontWeight: '700' },
  answerInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surfaceLow,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  feedback: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  backText: { textAlign: 'center', color: Colors.primary, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '700' },
  completeCard: { gap: Spacing.sm, alignItems: 'center' },
  completeTitle: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.lg, fontWeight: '700' },
  completeText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  completeXp: { color: Colors.primary, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  errorText: { color: Colors.error, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
});
