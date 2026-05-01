import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { TimetableEntry } from '../../models/timetable';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { ComicPanelCard } from '../shared/ComicPanelCard';

interface TimetableCardProps {
  entries: TimetableEntry[];
  onPress: () => void;
}

function toMinuteValue(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function TimetableCard({ entries, onPress }: TimetableCardProps) {
  const scale = useSharedValue(1);
  const badgePulse = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const badgeAnimStyle = useAnimatedStyle(() => ({
    opacity: 0.68 + badgePulse.value * 0.32,
    transform: [{ scale: 0.96 + badgePulse.value * 0.06 }],
  }));
  const now = dayjs();
  const currentMinutes = now.hour() * 60 + now.minute();
  const sorted = [...entries].sort((a, b) => toMinuteValue(a.start_time) - toMinuteValue(b.start_time));
  const upcoming = sorted.filter((item) => toMinuteValue(item.end_time) >= currentMinutes).slice(0, 2);

  useEffect(() => {
    badgePulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [badgePulse]);

  return (
    <Animated.View entering={FadeInUp.duration(280)} style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 110 });
        }}
      >
      <ComicPanelCard style={styles.card} dotColor={Colors.primaryContainer} halftoneOpacity={0.08} padding={14}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Today's Missions</Text>
          <MaterialIcons name="calendar-month" size={18} color={Colors.primary} />
        </View>
        {upcoming.length === 0 ? (
          <Text style={styles.empty}>No classes today</Text>
        ) : (
          <View style={styles.list}>
            {upcoming.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View style={[styles.border, { backgroundColor: entry.color || Colors.primary }]} />
                <View style={styles.info}>
                  <Text style={styles.subject}>{entry.subject}</Text>
                  <Text style={styles.time}>
                    {entry.start_time} - {entry.end_time}
                  </Text>
                </View>
                <Animated.View style={badgeAnimStyle}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>UP NEXT</Text>
                  </View>
                </Animated.View>
              </View>
            ))}
          </View>
        )}
      </ComicPanelCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  list: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 3,
    borderColor: '#111111',
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 0,
  },
  badge: {
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#111111',
    fontFamily: Typography.fontFamily.button,
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  border: {
    width: 4,
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  info: {
    gap: 2,
  },
  subject: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  time: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  empty: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
