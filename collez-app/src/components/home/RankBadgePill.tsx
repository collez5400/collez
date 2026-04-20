import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BadgeIcon } from '../shared/BadgeIcon';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { RankTier, getRankMeta } from '../../utils/rankCalculator';

interface RankBadgePillProps {
  tier: RankTier;
}

export function RankBadgePill({ tier }: RankBadgePillProps) {
  const rank = getRankMeta(tier);

  return (
    <View style={[styles.pill, { borderColor: `${rank.color}55`, backgroundColor: `${rank.color}22` }]}>
      <BadgeIcon type="rank" iconName={rank.icon} color={rank.color} size={18} />
      <Text style={styles.label}>Rank</Text>
      <Text style={styles.value}>{rank.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '600',
  },
  value: {
    color: Colors.onSurface,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
  },
});
