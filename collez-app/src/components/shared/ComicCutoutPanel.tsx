import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { HalftoneOverlay } from './HalftoneOverlay';
import { Colors, BorderRadius } from '../../config/theme';
import { HardShadowBox } from './HardShadowBox';

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
    <HardShadowBox shadowOffset={8} borderRadius={BorderRadius.xl} style={style}>
      <View style={[styles.panel, { backgroundColor }]}>
        <HalftoneOverlay dotColor={dotColor} spacing={dotSpacing} opacity={halftoneOpacity} />
        {children}
      </View>
    </HardShadowBox>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
});

