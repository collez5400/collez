import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

type EmptyStateProps = {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description?: string;
  compact?: boolean;
};

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  compact = false,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <MaterialIcons
        name={icon}
        size={compact ? 34 : 54}
        color={compact ? Colors.outline : Colors.surfaceHigh}
      />
      <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  compactContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  title: {
    marginTop: Spacing.md,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  compactTitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.md,
  },
  description: {
    marginTop: Spacing.xs,
    color: Colors.outline,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
});
