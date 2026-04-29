import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography } from '../../config/theme';

interface ComicProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  accentColor?: string;
}

export function ComicProgressRing({
  progress,
  size = 72,
  strokeWidth = 6,
  label,
  accentColor = Colors.primaryContainer,
}: ComicProgressRingProps) {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.max(safeProgress * circumference, circumference * 0.06);

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${accentColor}33`}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled}, ${circumference}`}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHighest,
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  label: {
    color: Colors.primaryContainer,
    fontFamily: Typography.fontFamily.button,
    fontSize: Typography.size.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
