import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface XpProgressBarProps {
  progress: number;
  xpNeededToNextRank: number;
}

export function XpProgressBar({ progress, xpNeededToNextRank }: XpProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(Math.max(0, Math.min(1, progress)))).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 450,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  const width = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Progress to next rank</Text>
        <Text style={styles.value}>{xpNeededToNextRank} XP left</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  value: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceHigh,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
});
