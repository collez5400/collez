import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';

interface StreakStatPillProps {
  streakCount: number;
}

export function StreakStatPill({ streakCount }: StreakStatPillProps) {
  return (
    <View style={styles.pill}>
      <MaterialIcons name="local-fire-department" size={20} color={Colors.warning} />
      <Text style={styles.label}>Streak</Text>
      <Text style={styles.value}>{streakCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${Colors.warning}44`,
    backgroundColor: `${Colors.warning}22`,
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '600',
  },
  value: {
    color: Colors.onSurface,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    minWidth: 24,
  },
});

