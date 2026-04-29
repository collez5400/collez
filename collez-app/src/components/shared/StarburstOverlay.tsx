import React, { useMemo } from 'react';
import Svg, { Polygon } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

function buildStarburstPoints({
  size,
  spikes,
  innerRatio,
}: {
  size: number;
  spikes: number;
  innerRatio: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const innerR = outerR * innerRatio;

  // Alternate outer/inner radii to create the "comic explosion" starburst.
  const points = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export function StarburstOverlay({
  size = 260,
  spikes = 12,
  innerRatio = 0.55,
  color = Colors.primaryContainer,
  opacity = 0.9,
  outlineColor = '#111111',
  outlineWidth = 3,
  style,
}: {
  size?: number;
  spikes?: number;
  innerRatio?: number;
  color?: string;
  opacity?: number;
  outlineColor?: string;
  outlineWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const points = useMemo(
    () =>
      buildStarburstPoints({
        size,
        spikes,
        innerRatio,
      }),
    [size, spikes, innerRatio],
  );

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={[
        {
          position: 'absolute',
          top: -12,
          left: -12,
        },
        style,
      ]}
      pointerEvents="none"
    >
      <Polygon points={points} fill={color} opacity={opacity} stroke={outlineColor} strokeWidth={outlineWidth} />
    </Svg>
  );
}

