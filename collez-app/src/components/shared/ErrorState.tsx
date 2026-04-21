import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorState({ title = 'Something went wrong', message, onRetry, compact }: ErrorStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <MaterialIcons name="error-outline" size={compact ? 34 : 54} color={Colors.error} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retry"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <MaterialIcons name="refresh" size={18} color={Colors.primary} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
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
  compact: {
    paddingVertical: Spacing.md,
  },
  title: {
    marginTop: Spacing.md,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    marginTop: Spacing.xs,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.primary}66`,
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  retryText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});

