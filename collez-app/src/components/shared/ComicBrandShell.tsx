import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';
import { HalftoneOverlay } from './HalftoneOverlay';
import { Colors } from '../../config/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function GlowBlob({
  left,
  top,
  size,
  color,
  delayMs,
}: {
  left: number;
  top: number;
  size: number;
  color: string;
  delayMs: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 0.18, duration: 900, delay: delayMs, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -18, duration: 2600, delay: 0, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 2600, delay: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [delayMs, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          left,
          top,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    />
  );
}

export function ComicBrandShell({
  children,
  style,
  contentStyle,
  dotColor = '#6b03f1',
  dotSpacing = 16,
  halftoneOpacity = 0.15,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  dotColor?: string;
  dotSpacing?: number;
  halftoneOpacity?: number;
}) {
  const glows = useMemo(
    () => [
      { left: -60, top: 100, size: 260, color: Colors.primary, delayMs: 0 },
      { left: SCREEN_W - 180, top: SCREEN_H * 0.35, size: 300, color: Colors.primaryContainer, delayMs: 250 },
      { left: 40, top: SCREEN_H * 0.65, size: 220, color: Colors.secondaryContainer, delayMs: 500 },
    ],
    [],
  );

  return (
    <View style={[styles.root, style]}>
      <HalftoneOverlay dotColor={dotColor} spacing={dotSpacing} opacity={halftoneOpacity} />
      {glows.map(g => (
        <GlowBlob
          // eslint-disable-next-line react/no-array-index-key
          key={`${g.left}-${g.top}-${g.size}`}
          left={g.left}
          top={g.top}
          size={g.size}
          color={g.color}
          delayMs={g.delayMs}
        />
      ))}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  blob: {
    position: 'absolute',
    shadowOpacity: 0,
    elevation: 0,
  },
});

