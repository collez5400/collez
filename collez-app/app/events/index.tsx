import { useFocusEffect, useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { GlassCard } from '../../src/components/shared/GlassCard';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { useEventStore } from '../../src/store/eventStore';

function getCountdownLabel(endTime: string) {
  const now = dayjs();
  const target = dayjs(endTime);
  if (target.isBefore(now)) return 'Ended';
  const hours = target.diff(now, 'hour');
  const minutes = target.diff(now, 'minute') % 60;
  if (hours > 0) return `${hours}h ${Math.max(minutes, 0)}m left`;
  return `${Math.max(minutes, 0)}m left`;
}

export default function EventsScreen() {
  const router = useRouter();
  const { liveEvents, upcomingEvents, pastEvents, fetchEvents, isLoading } = useEventStore();
  const [showPast, setShowPast] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchEvents();
    }, [fetchEvents])
  );

  const hasAnyEvents = useMemo(
    () => liveEvents.length > 0 || upcomingEvents.length > 0 || pastEvents.length > 0,
    [liveEvents.length, upcomingEvents.length, pastEvents.length]
  );

  const getEventRoute = (eventType: string, eventId: string) => {
    if (eventType === 'treasure_hunt') return `/events/hunt/${eventId}`;
    if (eventType === 'puzzle_rush') return `/events/puzzle/${eventId}`;
    if (eventType === 'college_battle') return `/events/battle/${eventId}`;
    return `/events/trivia/${eventId}`;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Compete in live events and earn XP rewards.</Text>

      {!hasAnyEvents && !isLoading ? (
        <EmptyState
          icon="event-busy"
          title="No active events right now"
          description="Check back soon for upcoming trivia drops."
        />
      ) : null}

      {liveEvents.map((event) => (
        <Pressable key={event.id} onPress={() => router.push(getEventRoute(event.event_type, event.id) as never)} style={styles.cardPressable}>
          {event.banner_image_url ? (
            <ImageBackground source={{ uri: event.banner_image_url }} style={styles.liveBanner} imageStyle={styles.bannerImage}>
              <View style={styles.liveOverlay}>
                <Text style={styles.livePill}>LIVE</Text>
                <Text style={styles.liveTitle}>{event.title}</Text>
                <Text style={styles.liveDesc}>{event.description ?? 'Challenge is live now.'}</Text>
              </View>
            </ImageBackground>
          ) : (
            <GlassCard style={styles.liveFallback}>
              <Text style={styles.livePill}>LIVE</Text>
              <Text style={styles.liveTitle}>{event.title}</Text>
              <Text style={styles.liveDesc}>{event.description ?? 'Challenge is live now.'}</Text>
            </GlassCard>
          )}
        </Pressable>
      ))}

      {upcomingEvents.length > 0 ? <Text style={styles.sectionTitle}>Upcoming</Text> : null}
      {upcomingEvents.map((event) => (
        <GlassCard key={event.id} style={styles.upcomingCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.upcomingTitle}>{event.title}</Text>
            <Text style={styles.countdown}>{getCountdownLabel(event.start_time)}</Text>
          </View>
          <Text style={styles.upcomingDesc}>{event.description ?? 'Get ready for the next challenge.'}</Text>
        </GlassCard>
      ))}

      {pastEvents.length > 0 ? (
        <Pressable style={styles.rowBetween} onPress={() => setShowPast((prev) => !prev)}>
          <Text style={styles.sectionTitle}>Past events</Text>
          <Text style={styles.toggle}>{showPast ? 'Hide' : 'Show'}</Text>
        </Pressable>
      ) : null}

      {showPast
        ? pastEvents.map((event) => (
            <GlassCard key={event.id} style={styles.pastCard}>
              <Text style={styles.pastTitle}>{event.title}</Text>
              <Text style={styles.pastBadge}>Badge: {event.badge_name ?? 'Participation badge'}</Text>
            </GlassCard>
          ))
        : null}
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
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  cardPressable: { borderRadius: 18, overflow: 'hidden' },
  liveBanner: { minHeight: 170, justifyContent: 'flex-end' },
  bannerImage: { borderRadius: 18 },
  liveOverlay: { backgroundColor: 'rgba(11, 19, 38, 0.72)', padding: Spacing.md, gap: Spacing.xs },
  liveFallback: { minHeight: 160, justifyContent: 'center', gap: Spacing.xs },
  livePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    color: '#fff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  liveTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  liveDesc: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upcomingCard: { gap: Spacing.xs },
  upcomingTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
    flex: 1,
    paddingRight: Spacing.sm,
  },
  countdown: { color: Colors.primary, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.xs, fontWeight: '700' },
  upcomingDesc: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
  toggle: { color: Colors.primary, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm, fontWeight: '700' },
  pastCard: { gap: Spacing.xs },
  pastTitle: { color: Colors.onSurface, fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.md, fontWeight: '700' },
  pastBadge: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontSize: Typography.size.sm },
});
