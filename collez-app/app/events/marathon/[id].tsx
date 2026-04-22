import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../../src/config/theme';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { useAuthStore } from '../../../src/store/authStore';
import { useEventStore } from '../../../src/store/eventStore';
import { useXpStore } from '../../../src/store/xpStore';
import { supabase } from '../../../src/config/supabase';

type MarathonProgress = {
  completedDays: number;
  targetDays: number;
  bonusXp: number;
  rewardClaimed: boolean;
};

export default function StreakMarathonScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const eventId = typeof params.id === 'string' ? params.id : '';
  const authUserId = useAuthStore((s) => s.user?.id ?? '');
  const { liveEvents, upcomingEvents, pastEvents, fetchEvents, joinEvent, getParticipation } = useEventStore();
  const { awardXpForAction } = useXpStore();
  const [progress, setProgress] = useState<MarathonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const event = useMemo(
    () => [...liveEvents, ...upcomingEvents, ...pastEvents].find((item) => item.id === eventId) ?? null,
    [eventId, liveEvents, pastEvents, upcomingEvents]
  );

  const load = useCallback(async () => {
    if (!eventId || !authUserId) return;
    setLoading(true);
    setError(null);
    try {
      await fetchEvents();
      await joinEvent(eventId);
      const participation = await getParticipation(eventId);

      const currentEvent = [...useEventStore.getState().liveEvents, ...useEventStore.getState().upcomingEvents, ...useEventStore.getState().pastEvents]
        .find((item) => item.id === eventId);
      if (!currentEvent || currentEvent.event_type !== 'streak_marathon') {
        throw new Error('Streak marathon event not found.');
      }

      const cfg = (currentEvent.config ?? {}) as Record<string, unknown>;
      const targetDays = Number(cfg.target_days ?? 30);
      const bonusXp = Number(cfg.bonus_xp ?? currentEvent.xp_reward ?? 60);

      const startIso = currentEvent.start_time;
      const endIso = dayjs(currentEvent.end_time).isBefore(dayjs()) ? currentEvent.end_time : new Date().toISOString();
      const { data: streakRows, error: streakError } = await (supabase as any)
        .from('streak_logs')
        .select('logged_date')
        .eq('user_id', authUserId)
        .gte('logged_date', startIso.split('T')[0])
        .lte('logged_date', endIso.split('T')[0]);
      if (streakError) throw new Error(streakError.message);

      const uniqueDays = new Set((streakRows ?? []).map((row: { logged_date: string }) => row.logged_date));
      const rewardClaimed = Boolean((participation?.progress as Record<string, unknown> | null)?.marathon_reward_claimed);
      setProgress({
        completedDays: uniqueDays.size,
        targetDays,
        bonusXp,
        rewardClaimed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marathon progress.');
    } finally {
      setLoading(false);
    }
  }, [authUserId, eventId, fetchEvents, getParticipation, joinEvent]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const canClaim = !!progress && progress.completedDays >= progress.targetDays && !progress.rewardClaimed;

  const claimBonus = async () => {
    if (!canClaim || !eventId) return;
    setClaiming(true);
    setError(null);
    try {
      const result = await awardXpForAction({
        source: 'event',
        amount: progress.bonusXp,
        sourceId: eventId,
        description: `Streak marathon completion bonus (${progress.targetDays} days)`,
      });
      if (!result) throw new Error('Could not award streak marathon bonus XP.');

      const participation = await getParticipation(eventId);
      const oldProgress = (participation?.progress ?? {}) as Record<string, unknown>;
      const nextProgress = {
        ...oldProgress,
        marathon_reward_claimed: true,
        marathon_reward_claimed_at: new Date().toISOString(),
      };
      await (supabase as any)
        .from('event_participations')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          progress: nextProgress,
          xp_earned: Number(participation?.xp_earned ?? 0) + result.awardedXp,
        })
        .eq('event_id', eventId)
        .eq('user_id', authUserId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim bonus.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{event?.title ?? 'Streak Marathon'}</Text>
        <Text style={styles.subtitle}>Maintain your streak through the full challenge window.</Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : null}

        {error ? (
          <GlassCard>
            <Text style={styles.errorText}>{error}</Text>
          </GlassCard>
        ) : null}

        {progress ? (
          <>
            <GlassCard style={styles.progressCard}>
              <View style={styles.row}>
                <MaterialIcons name="local-fire-department" size={18} color={Colors.secondary} />
                <Text style={styles.metricLabel}>Progress</Text>
              </View>
              <Text style={styles.metricValue}>
                {progress.completedDays}/{progress.targetDays} days
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.round((progress.completedDays / progress.targetDays) * 100))}%` },
                  ]}
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.progressCard}>
              <View style={styles.row}>
                <MaterialIcons name="bolt" size={18} color={Colors.primary} />
                <Text style={styles.metricLabel}>Completion reward</Text>
              </View>
              <Text style={styles.metricValue}>+{progress.bonusXp} XP</Text>
              <Text style={styles.helperText}>
                {progress.rewardClaimed
                  ? 'Reward claimed.'
                  : canClaim
                    ? 'You completed the marathon. Claim your bonus now.'
                    : `Keep going. ${Math.max(0, progress.targetDays - progress.completedDays)} day(s) left.`}
              </Text>
            </GlassCard>

            <GradientButton
              title={progress.rewardClaimed ? 'Reward Claimed' : claiming ? 'Claiming...' : 'Claim Bonus XP'}
              onPress={claimBonus}
              disabled={!canClaim || claiming || progress.rewardClaimed}
            />
          </>
        ) : null}

        {!loading ? (
          <Pressable onPress={() => void load()} style={styles.refreshBtn}>
            <MaterialIcons name="refresh" size={16} color={Colors.primary} />
            <Text style={styles.refreshText}>Refresh progress</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  loadingWrap: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  progressCard: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  metricValue: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  helperText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  progressTrack: {
    height: 10,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  refreshBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: `${Colors.primary}66`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});
