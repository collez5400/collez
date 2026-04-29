import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { useAuthStore } from '../../store/authStore';
import { ComicPanelCard } from '../shared/ComicPanelCard';
import { ComicProgressRing } from '../shared/ComicProgressRing';

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
    <Animated.View entering={FadeIn.duration(280)}>
      <Pressable style={styles.card} onPress={() => router.push('/(tabs)/rankings')}>
      <ComicPanelCard style={styles.card} padding={16}>
        <View style={styles.header}>
          <Text style={styles.title}>College Rank</Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
        </View>

        <View style={styles.body}>
          <ComicProgressRing
            progress={progress}
            label={userCollegeRank ? `#${userCollegeRank}` : '--'}
            size={72}
            strokeWidth={5}
            accentColor={Colors.primaryContainer}
          />

          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>
              {myRow?.full_name ?? 'Tap to view leaderboard'}
            </Text>
            <Text style={styles.subtext}>{myRow ? `${myRow.xp} XP` : 'No rank data yet'}</Text>
          </View>
        </View>
      </ComicPanelCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  meta: {
    width: '100%',
    minWidth: 0,
    gap: 4,
    alignItems: 'center',
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
    textAlign: 'center',
  },
});
