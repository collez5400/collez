import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { HalftoneOverlay } from './HalftoneOverlay';
import { Colors, BorderRadius } from '../../config/theme';

export function ComicCutoutPanel({
  children,
  style,
  dotColor = Colors.primaryContainer,
  dotSpacing = 12,
  halftoneOpacity = 0.12,
  backgroundColor = Colors.secondaryContainer,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  dotColor?: string;
  dotSpacing?: number;
  halftoneOpacity?: number;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.panel, { backgroundColor }, style]}>
      <HalftoneOverlay dotColor={dotColor} spacing={dotSpacing} opacity={halftoneOpacity} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    // Heavy offset shadow like comic ink depth.
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 8, height: 8 },
    shadowRadius: 0,
    elevation: 0,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
});

