import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
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
  const scale = useSharedValue(0.92);
  scale.value = withSequence(withTiming(1.04, { duration: 200 }), withTiming(1, { duration: 180 }));
  const iconAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(260)} style={[styles.container, compact && styles.compactContainer]}>
      <Animated.View style={[styles.iconWrap, iconAnim]}>
        <MaterialIcons
          name={icon}
          size={compact ? 28 : 38}
          color={compact ? Colors.outline : Colors.onSurfaceVariant}
        />
      </Animated.View>
      <Text style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Animated.View>
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
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.surfaceHigh}77`,
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
    fontStyle: 'italic',
  },
});
