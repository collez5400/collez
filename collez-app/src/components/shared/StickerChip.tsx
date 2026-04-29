import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../config/theme';

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
    <View style={[styles.chip, { backgroundColor: toneStyle.backgroundColor }, style]}>
      <Text style={[styles.label, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 0,
  },
  label: {
    fontFamily: Typography.fontFamily.button,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});
