import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/config/theme';
import { useStreakStore } from '../../src/store/streakStore';
import { useXpStore } from '../../src/store/xpStore';
import { getRankMeta } from '../../src/utils/rankCalculator';

export default function ProfileScreen() {
  const { streakCount, longestStreak, fetchStreakData } = useStreakStore();
  const { totalXp, rankTier, fetchXpData } = useXpStore();
  const rank = getRankMeta(rankTier);

  useEffect(() => {
    void fetchStreakData();
    void fetchXpData();
  }, [fetchStreakData, fetchXpData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.stat}>XP: {totalXp}</Text>
      <Text style={[styles.stat, { color: rank.color }]}>Rank: {rank.label}</Text>
      <Text style={styles.stat}>Current streak: {streakCount} days</Text>
      <Text style={styles.stat}>Longest streak: {longestStreak} days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 8,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  stat: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
});
