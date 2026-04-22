import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Typography } from '../../config/theme';
import { LeaderboardEntry } from '../../store/leaderboardStore';

interface RankRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  showCollege?: boolean;
  xpLabel?: string;
}

const getRankDisplay = (position: number): string => {
  if (position === 1) return '🥇';
  if (position === 2) return '🥈';
  if (position === 3) return '🥉';
  return `#${position}`;
};

export function RankRow({ entry, isCurrentUser, showCollege = true, xpLabel = 'XP' }: RankRowProps) {
  const coordinatorRoleLabel =
    entry.coordinator_type === 'city'
      ? `City Coordinator${entry.coordinator_region ? ` • ${entry.coordinator_region}` : ''}`
      : entry.coordinator_type === 'state'
        ? `State Coordinator${entry.coordinator_region ? ` • ${entry.coordinator_region}` : ''}`
        : entry.is_coordinator
          ? 'College Coordinator'
          : null;

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <Text style={styles.rank}>{getRankDisplay(entry.position)}</Text>

      {entry.avatar_url ? (
        <Image source={{ uri: entry.avatar_url }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <MaterialIcons name="person" size={16} color={Colors.onSurfaceVariant} />
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.full_name}
          {entry.is_coordinator ? (
            <Text style={styles.verified}>
              {' '}
              <MaterialIcons name="verified" size={14} color={Colors.secondary} />
            </Text>
          ) : null}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          @{entry.username}
          {showCollege && entry.college_name ? ` • ${entry.college_name}` : ''}
        </Text>
        {coordinatorRoleLabel ? (
          <Text style={styles.roleMeta} numberOfLines={1}>
            {coordinatorRoleLabel}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightInfo}>
        <Text style={styles.xp}>{entry.xp}</Text>
        <Text style={styles.xpLabel}>{xpLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  currentUserContainer: {
    borderColor: `${Colors.primary}88`,
    backgroundColor: `${Colors.primary}22`,
  },
  rank: {
    width: 48,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  verified: {
    color: Colors.secondary,
  },
  meta: {
    marginTop: 2,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  roleMeta: {
    marginTop: 2,
    color: Colors.secondary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  xp: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  xpLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});
