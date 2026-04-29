import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../config/theme';
import { COLLEZ_LOGO_URI, COLLEZ_TAGLINE, COLLEZ_WORDMARK } from '../../config/branding';

export function WordmarkLockup({
  variant = 'default',
  style,
}: {
  variant?: 'default' | 'compact';
  style?: ViewStyle;
}) {
  const logoSize = variant === 'compact' ? 44 : 72;

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.logoFrame, { width: logoSize, height: logoSize }]}>
        <Image source={{ uri: COLLEZ_LOGO_URI }} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.wordmark}>{COLLEZ_WORDMARK}</Text>
      <Text style={styles.tagline}>{COLLEZ_TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 10,
  },
  logoFrame: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 6, height: 6 },
    shadowRadius: 0,
    elevation: 0,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  wordmark: {
    fontFamily: Typography.fontFamily.display,
    fontWeight: '900',
    fontSize: 46,
    color: Colors.primary,
    textTransform: 'uppercase',
    textAlign: 'center',
    letterSpacing: -1.6,
    textShadowColor: '#6b03f1',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  tagline: {
    fontFamily: Typography.fontFamily.button,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: Colors.primaryFixedDim ?? Colors.primaryFixedDim,
    textAlign: 'center',
  },
});

