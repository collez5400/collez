import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../config/theme';
import { HalftoneOverlay } from './HalftoneOverlay';
import { StarburstOverlay } from './StarburstOverlay';

export function RewardExplosionSpotlight({
  children,
  style,
  burstColor = Colors.primaryContainer,
  dotColor = '#6b03f1',
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  burstColor?: string;
  dotColor?: string;
}) {
  return (
    <View style={[styles.card, style]}>
      <HalftoneOverlay dotColor={dotColor} spacing={12} opacity={0.12} />
      <StarburstOverlay size={300} spikes={12} innerRatio={0.5} color={burstColor} opacity={0.9} style={styles.burst} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.secondaryContainer,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 10, height: 10 },
    shadowRadius: 0,
    elevation: 0,
  },
  burst: {
    top: -10,
    left: -10,
  },
});

