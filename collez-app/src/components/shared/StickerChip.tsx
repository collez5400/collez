import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Typography } from '../../config/theme';
import { HardShadowBox } from './HardShadowBox';

type StickerChipTone = 'yellow' | 'purple' | 'dark' | 'danger' | 'success';

interface StickerChipProps {
  label: string;
  tone?: StickerChipTone;
  style?: ViewStyle;
}

const TONE_STYLES: Record<StickerChipTone, { backgroundColor: string; color: string }> = {
  yellow: { backgroundColor: Colors.primaryContainer, color: '#111111' },
  purple: { backgroundColor: Colors.secondaryContainer, color: Colors.onSecondaryContainer },
  dark: { backgroundColor: Colors.surfaceContainerLowest, color: Colors.primaryContainer },
  danger: { backgroundColor: '#ff6b6b', color: '#111111' },
  success: { backgroundColor: '#8dff72', color: '#111111' },
};

export function StickerChip({ label, tone = 'yellow', style }: StickerChipProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <HardShadowBox shadowOffset={3} borderRadius={BorderRadius.full} style={style}>
      <View style={[styles.chip, { backgroundColor: toneStyle.backgroundColor }]}>
        <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
      </View>
    </HardShadowBox>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    fontFamily: Typography.fontFamily.button,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});
