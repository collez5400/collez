import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../../src/components/shared/EmptyState';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { Colors, Spacing, Typography } from '../../../src/config/theme';
import { type CollegeBattleStanding } from '../../../src/models/event';
import { useEventStore } from '../../../src/store/eventStore';

function formatScore(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(Math.max(0, Math.floor(value)));
}

export default function CollegeBattleScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const eventId = useMemo(() => (typeof params.id === 'string' ? params.id : ''), [params.id]);
  const { liveEvents, upcomingEvents, pastEvents, fetchEvents, fetchCollegeBattleStandings } = useEventStore();

  const [standings, setStandings] = useState<CollegeBattleStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const event = useMemo(
    () => [...liveEvents, ...upcomingEvents, ...pastEvents].find((item) => item.id === eventId),
    [eventId, liveEvents, pastEvents, upcomingEvents]
  );

  const loadData = useCallback(
    async (refresh = false) => {
      if (!eventId) return;
      if (refresh) {
        await fetchEvents();
      }
      const next = await fetchCollegeBattleStandings(eventId);
      setStandings(next);
      setIsLoading(false);
    },
    [eventId, fetchCollegeBattleStandings, fetchEvents]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(true);
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
    >
      <Text style={styles.title}>{event?.title ?? 'College Battle'}</Text>
      <Text style={styles.subtitle}>
        {event?.description ?? 'Colleges compete using normalized score: total XP earned / student count.'}
      </Text>

      {event?.status ? (
        <GlassCard style={styles.metaCard}>
          <Text style={styles.metaText}>Status: {event.status.toUpperCase()}</Text>
          <Text style={styles.metaText}>Battle type: XP Race</Text>
        </GlassCard>
      ) : null}

      {!isLoading && standings.length === 0 ? (
        <EmptyState
          icon="groups"
          title="No college battle data yet"
          description="When colleges start earning XP in this battle window, rankings will appear here."
        />
      ) : null}

      {standings.map((standing, index) => {
        const highestScore = standings[0]?.score || 1;
        const widthPercent = Math.max(8, Math.round((standing.score / highestScore) * 100));
        const isTopThree = index < 3;
        return (
          <GlassCard key={standing.college_id} style={styles.rowCard}>
            <View style={styles.rowHeader}>
              <Text style={styles.rankText}>#{standing.rank}</Text>
              <Text style={styles.collegeName}>{standing.college_name}</Text>
              <Text style={[styles.eligibility, standing.eligible ? styles.eligible : styles.ineligible]}>
                {standing.eligible ? 'Eligible' : 'Not eligible'}
              </Text>
            </View>

            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${widthPercent}%` },
                  isTopThree ? styles.barTopThree : styles.barDefault,
                ]}
              />
            </View>

            <View style={styles.metricsRow}>
              <Text style={styles.metric}>Score: {formatScore(standing.score)}</Text>
              <Text style={styles.metric}>Battle XP: {formatNumber(standing.total_xp_earned)}</Text>
              <Text style={styles.metric}>Participants: {formatNumber(standing.participant_count)}</Text>
            </View>
          </GlassCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xl },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  subtitle: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  metaCard: { gap: Spacing.xs },
  metaText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  rowCard: { gap: Spacing.sm },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rankText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.md,
    minWidth: 34,
  },
  collegeName: {
    flex: 1,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    fontSize: Typography.size.md,
  },
  eligibility: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  eligible: { backgroundColor: '#14532d', color: '#bbf7d0' },
  ineligible: { backgroundColor: '#7f1d1d', color: '#fecaca' },
  barTrack: { height: 10, backgroundColor: `${Colors.outline}33`, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  barTopThree: { backgroundColor: Colors.primary },
  barDefault: { backgroundColor: Colors.secondary },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metric: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.xs },
});
