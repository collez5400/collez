import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { useAuthStore } from '../../../src/store/authStore';
import { supabase } from '../../../src/config/supabase';
import { XP_VALUES } from '../../../src/config/constants';
import { applyReferralCode } from '../../../src/services/referralService';
import {
  Colors, Typography, Spacing, BorderRadius,
} from '../../../src/config/theme';
import { ComicBrandShell } from '../../../src/components/shared/ComicBrandShell';
import { WordmarkLockup } from '../../../src/components/shared/WordmarkLockup';
import { RewardExplosionSpotlight } from '../../../src/components/shared/RewardExplosionSpotlight';
import { ComicProgressBar } from '../../../src/components/shared/ComicProgressBar';
import { StickerChip } from '../../../src/components/shared/StickerChip';
import { HardShadowBox } from '../../../src/components/shared/HardShadowBox';

const TOTAL_STEPS = 3;
const STEP = 3;

// Confetti particle animation
function ConfettiDot({
  color, delay, startX, startY,
}: {
  color: string; delay: number; startX: number; startY: number;
}) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(startY + 200, { duration: 1400, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(800, withTiming(0, { duration: 400 }))
    ));
    rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 700 }), 2, false));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function FloatingRewardProp({
  label,
  top,
  left,
  right,
  rotateDeg,
  tone,
  delay,
}: {
  label: string;
  top: number;
  left?: number;
  right?: number;
  rotateDeg: number;
  tone: 'yellow' | 'purple' | 'dark' | 'success';
  delay: number;
}) {
  const bob = useSharedValue(0);
  const tilt = useSharedValue(rotateDeg);

  useEffect(() => {
    bob.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
    tilt.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(rotateDeg + 4, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(rotateDeg - 4, { duration: 900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, [bob, delay, rotateDeg, tilt]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { rotate: `${tilt.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.floatingRewardProp, { top, left, right }, animatedStyle]}>
      <StickerChip label={label} tone={tone} />
    </Animated.View>
  );
}

const CONFETTI_COLORS = [
  Colors.primary, Colors.primaryVariant, Colors.secondary,
  Colors.success, Colors.warning,
];

export default function OnboardingStep3() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    fullName: string;
    username: string;
    avatarUri: string;
    collegeId?: string;
    collegeName: string;
    referralCode?: string;
  }>();

  const { user, completeOnboarding } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Animations
  const progressWidth = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const xpBadgeScale = useSharedValue(0);

  const progressAnimStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));
  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const xpAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpBadgeScale.value }],
  }));

  useEffect(() => {
    progressWidth.value = withTiming(100, { duration: 600 });

    // Card entrance
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    cardScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 120 }));

    // XP badge pop
    xpBadgeScale.value = withDelay(800, withSpring(1, { damping: 10, stiffness: 150 }));
  }, []);

  // Confetti data (deterministic)
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: i * 60,
    startX: (i % 5) * 60 - 120,
    startY: -60 - (i % 3) * 20,
  }));

  async function handleEnter() {
    setLoading(true);
    try {
      // Upload avatar if provided
      let avatarUrl: string | null = user?.avatar_url ?? null;
      if (params.avatarUri && params.avatarUri.startsWith('file://')) {
        const fileName = `${user!.id}/avatar.jpg`;
        const formData = new FormData();
        formData.append('file', {
          uri: params.avatarUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Award +2 XP for Day 1 login via streak action
      // @ts-expect-error Supabase type shim limitations
      await supabase.from('xp_transactions').insert({
        user_id: user!.id,
        source: 'daily_login',
        amount: XP_VALUES.DAILY_LOGIN,
      });

      // Commit all onboarding fields
      await completeOnboarding({
        full_name: params.fullName,
        username: params.username,
        avatar_url: avatarUrl,
        college_id: params.collegeId?.trim() ? params.collegeId : null,
        streak_count: 1,
        xp: XP_VALUES.DAILY_LOGIN,
        last_active_date: new Date().toISOString().split('T')[0],
      });

      if (params.referralCode?.trim()) {
        await applyReferralCode(user!.id, params.referralCode);
      }

      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Something went wrong', err?.message ?? 'Please try again.');
      setLoading(false);
    }
  }

  return (
    <ComicBrandShell dotColor="#6b03f1" dotSpacing={12} halftoneOpacity={0.1}>
      <View style={styles.root}>
        {/* Confetti */}
        <View style={styles.confettiContainer} pointerEvents="none">
          {confetti.map(c => (
            <ConfettiDot key={c.id} {...c} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.wordmarkWrap}>
            <WordmarkLockup variant="compact" />
          </View>

          {/* Progress */}
          <ComicProgressBar
            progress={STEP / TOTAL_STEPS}
            valueLabel={`Step ${STEP} of ${TOTAL_STEPS}`}
            style={styles.progressTrack}
            compact
          />
          <Text style={styles.stepLabel}>Step {STEP} of {TOTAL_STEPS}</Text>

          <RewardExplosionSpotlight style={styles.rewardsPanel}>
            <Text style={styles.rewardsKicker}>REWARD DROP</Text>

            {/* Floating XP props (comic “props” around the badge) */}
            <FloatingRewardProp label={`+${XP_VALUES.DAILY_LOGIN}`} tone="yellow" top={28} left={8} rotateDeg={-8} delay={200} />
            <FloatingRewardProp label="XP DROP" tone="purple" top={84} right={10} rotateDeg={8} delay={420} />
            <FloatingRewardProp label="STREAK" tone="dark" top={142} left={18} rotateDeg={-4} delay={620} />
            <FloatingRewardProp label="BONUS" tone="success" top={170} right={18} rotateDeg={5} delay={760} />

            <Animated.View style={[styles.xpBadge, xpAnimStyle]}>
              <HardShadowBox shadowOffset={6} borderRadius={BorderRadius.md}>
                <View style={styles.xpBadgeInner}>
                  <Text style={styles.xpText}>+{XP_VALUES.DAILY_LOGIN} XP</Text>
                </View>
              </HardShadowBox>
            </Animated.View>

            <View style={styles.rewardsCtaWrap}>
              <GradientButton
                title="Enter COLLEZ ⚡"
                onPress={handleEnter}
                loading={loading}
                variant="primary"
              />
            </View>
          </RewardExplosionSpotlight>

          <Text style={styles.emoji}>💥</Text>
          <Text style={styles.headline}>Rewards for{'\n'}showing up.</Text>
          <Text style={styles.subheadline}>
            Your daily login powers your streak—now jump into the app.
          </Text>

          {/* Summary card */}
          <Animated.View style={cardAnimStyle}>
            <GlassCard style={styles.summaryCard} padding={20}>
              <SummaryRow label="👤 Name" value={params.fullName} />
              <SummaryRow label="@ Username" value={`@${params.username}`} />
              <SummaryRow label="🏫 College" value={params.collegeName} />
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </View>
    </ComicBrandShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outline}22`,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
  },
  value: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurface,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  confettiContainer: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
    height: 300,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 40,
    alignItems: 'center',
  },
  wordmarkWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTrack: {
    marginBottom: Spacing.sm,
    width: '100%',
  },
  stepLabel: {
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    marginBottom: Spacing.xl,
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  headline: {
    fontSize: Typography.size.displayHero ?? 72,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.primary,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    textShadowColor: '#111111',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  subheadline: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  rewardsPanel: {
    marginBottom: Spacing.sm,
  },
  rewardsKicker: {
    fontFamily: Typography.fontFamily.button,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  rewardsCtaWrap: {
    width: '100%',
    marginTop: Spacing.md,
  },
  floatingRewardProp: {
    position: 'absolute',
  },
  xpBadge: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  xpBadgeInner: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: '#111111',
  },
  xpText: {
    fontSize: Typography.size.headlineMd ?? 24,
    fontFamily: Typography.fontFamily.heading,
    color: '#000000',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryCard: {
    width: '100%',
    borderWidth: 3,
    borderColor: '#111111',
  },
  // btnWrap intentionally removed: CTA now lives inside rewards spotlight.
});
