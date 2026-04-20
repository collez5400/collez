import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { useAuthStore } from '../../store/authStore';

export function LeaderboardMini() {
  const router = useRouter();
  const { collegeBoard, userCollegeRank } = useLeaderboardStore();
  const userId = useAuthStore((state) => state.user?.id);

  const progress = useMemo(() => {
    const total = Math.max(collegeBoard.length, 1);
    const rank = userCollegeRank ?? total;
    const normalized = 1 - (Math.min(rank, total) - 1) / total;
    return Math.max(0.05, normalized);
  }, [collegeBoard.length, userCollegeRank]);

  const myRow = useMemo(
    () => (userId ? collegeBoard.find((entry) => entry.id === userId) : null),
    [collegeBoard, userId]
  );

  return (
    <Pressable style={styles.card} onPress={() => router.push('/(tabs)/rankings')}>
      <View style={styles.header}>
        <Text style={styles.title}>College Rank</Text>
        <MaterialIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
      </View>

      <View style={styles.body}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <Text style={styles.rankText}>{userCollegeRank ? `#${userCollegeRank}` : '--'}</Text>
          </View>
          <View style={[styles.ringProgress, { width: `${progress * 100}%` }]} />
        </View>

        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {myRow?.full_name ?? 'Tap to view leaderboard'}
          </Text>
          <Text style={styles.subtext}>{myRow ? `${myRow.xp} XP` : 'No rank data yet'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ringOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: `${Colors.primary}55`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ringInner: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringProgress: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 5,
    backgroundColor: Colors.primary,
  },
  rankText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  subtext: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});
