import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
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
    <Animated.View entering={FadeIn.duration(280)}>
      <Pressable style={styles.card} onPress={() => router.push('/(tabs)/rankings')}>
      <View style={styles.header}>
        <Text style={styles.title}>College Rank</Text>
        <MaterialIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
      </View>

      <View style={styles.body}>
        <View style={styles.ringOuter}>
          <Svg width={72} height={72} style={styles.ringSvg}>
            <Circle cx={36} cy={36} r={31} stroke={`${Colors.primary}33`} strokeWidth={5} fill="none" />
            <Circle
              cx={36}
              cy={36}
              r={31}
              stroke={Colors.primary}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(progress * 194, 16)}, 194`}
              rotation={-90}
              originX={36}
              originY={36}
            />
          </Svg>
          <View style={styles.ringInner}>
            <Text style={styles.rankText}>{userCollegeRank ? `#${userCollegeRank}` : '--'}</Text>
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {myRow?.full_name ?? 'Tap to view leaderboard'}
          </Text>
          <Text style={styles.subtext}>{myRow ? `${myRow.xp} XP` : 'No rank data yet'}</Text>
        </View>
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#111111',
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 6, height: 6 },
    shadowRadius: 0,
    elevation: 0,
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
  ringOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  ringSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  ringInner: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
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
