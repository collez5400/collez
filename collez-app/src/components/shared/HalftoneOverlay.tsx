import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface HalftoneOverlayProps {
  dotColor?: string;
  opacity?: number;
  dotSize?: number;
  spacing?: number;
}

export function HalftoneOverlay({
  dotColor = '#6b03f1',
  opacity = 0.15,
  dotSize = 2,
  spacing = 16,
}: HalftoneOverlayProps) {
  const dots: Array<{ x: number; y: number }> = [];
  const size = 520;
  for (let y = spacing / 2; y < size; y += spacing) {
    for (let x = spacing / 2; x < size; x += spacing) {
      dots.push({ x, y });
    }
  }

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none">
        {dots.map((dot, index) => (
          <Circle key={`${dot.x}-${dot.y}-${index}`} cx={dot.x} cy={dot.y} r={dotSize} fill={dotColor} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 0,
  },
});
