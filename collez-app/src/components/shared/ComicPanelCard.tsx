import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../config/theme';
import { HalftoneOverlay } from './HalftoneOverlay';

interface ComicPanelCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  dotColor?: string;
  halftoneOpacity?: number;
  padding?: number;
}

export function ComicPanelCard({
  children,
  style,
  backgroundColor = Colors.surfaceContainerHigh,
  dotColor = Colors.primaryContainer,
  halftoneOpacity = 0.1,
  padding = 18,
}: ComicPanelCardProps) {
  return (
    <View style={[styles.card, { backgroundColor, padding }, style]}>
      <HalftoneOverlay dotColor={dotColor} spacing={12} opacity={halftoneOpacity} />
      <View style={styles.cornerAccent} />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 8, height: 8 },
    shadowRadius: 0,
    elevation: 0,
    position: 'relative',
  },
  inner: {
    zIndex: 1,
  },
  cornerAccent: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 38,
    height: 12,
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '-18deg' }],
  },
});
