import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';

interface XpStatPillProps {
  xp: number;
}

export function XpStatPill({ xp }: XpStatPillProps) {
  const animatedValue = useRef(new Animated.Value(xp)).current;
  const displayValue = useRef(xp);
  const [, forceRender] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      displayValue.current = Math.round(value);
      forceRender((prev) => prev + 1);
    });
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: xp,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, xp]);

  return (
    <View style={styles.pill}>
      <MaterialIcons name="bolt" size={20} color={Colors.primary} />
      <Text style={styles.label}>XP</Text>
      <Text style={styles.value}>{displayValue.current}</Text>
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
    borderColor: `${Colors.primary}44`,
    backgroundColor: `${Colors.primary}22`,
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
