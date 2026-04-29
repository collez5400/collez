import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../../config/theme';

interface ComicProgressBarProps {
  progress: number;
  label?: string;
  valueLabel?: string;
  style?: ViewStyle;
  compact?: boolean;
}

export function ComicProgressBar({
  progress,
  label,
  valueLabel,
  style,
  compact = false,
}: ComicProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

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
    <View style={style}>
      {(label || valueLabel) && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{valueLabel}</Text>
        </View>
      )}
      <View style={[styles.track, compact && styles.trackCompact]}>
        <Animated.View style={[styles.fillWrap, compact && styles.fillWrapCompact, { width }]}>
          <LinearGradient
            colors={[
              'rgba(255,212,0,1)',
              'rgba(255,243,214,0.8)',
              'rgba(107,3,241,0.95)',
              'rgba(255,212,0,1)',
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  value: {
    color: Colors.primaryContainer,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  track: {
    height: 20,
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerHighest,
    overflow: 'hidden',
    padding: 2,
  },
  trackCompact: {
    height: 14,
  },
  fillWrap: {
    height: '100%',
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: Colors.primaryContainer,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  fillWrapCompact: {
    borderWidth: 1.5,
  },
  fill: {
    flex: 1,
  },
});
