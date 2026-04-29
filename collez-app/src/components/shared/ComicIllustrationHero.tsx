import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Typography } from '../../config/theme';
import { COLLEZ_LOGO_URI } from '../../config/branding';
import { StickerChip } from './StickerChip';

export function ComicIllustrationHero() {
  return (
    <View style={styles.scene}>
      <View style={styles.backBurst} />
      <StickerChip label="Level Up" tone="yellow" style={styles.kickerLeft} />
      <StickerChip label="Campus Hero" tone="purple" style={styles.kickerRight} />

      <View style={styles.characterWrap}>
        <View style={styles.shadowBlob} />
        <View style={styles.head}>
          <View style={styles.eyeRow}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          <View style={styles.smile} />
        </View>

        <View style={styles.hoodie}>
          <Text style={styles.bolt}>⚡</Text>
        </View>

        <View style={styles.armLeft} />
        <View style={styles.armRight} />

        <View style={styles.phone}>
          <View style={styles.phoneCamera} />
        </View>

        <View style={styles.logoSticker}>
          <Image source={{ uri: COLLEZ_LOGO_URI }} style={styles.logo} contentFit="contain" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBurst: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 4,
    borderColor: '#111111',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 8, height: 8 },
    shadowRadius: 0,
  },
  kickerLeft: {
    position: 'absolute',
    left: 8,
    top: 10,
    transform: [{ rotate: '-10deg' }],
  },
  kickerRight: {
    position: 'absolute',
    right: 2,
    top: 30,
    transform: [{ rotate: '8deg' }],
  },
  characterWrap: {
    width: 210,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowBlob: {
    position: 'absolute',
    bottom: 14,
    width: 132,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(17,17,17,0.25)',
  },
  head: {
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 4,
    borderColor: '#111111',
    backgroundColor: '#fff3d6',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 10,
  },
  eye: {
    width: 10,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#111111',
  },
  smile: {
    width: 28,
    height: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#111111',
    borderRadius: 999,
  },
  hoodie: {
    width: 136,
    height: 112,
    marginTop: -12,
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: 26,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 8, height: 8 },
    shadowRadius: 0,
  },
  bolt: {
    fontSize: 40,
  },
  armLeft: {
    position: 'absolute',
    left: 26,
    top: 100,
    width: 32,
    height: 86,
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: 18,
    backgroundColor: '#fff3d6',
    transform: [{ rotate: '22deg' }],
  },
  armRight: {
    position: 'absolute',
    right: 34,
    top: 102,
    width: 32,
    height: 76,
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: 18,
    backgroundColor: '#fff3d6',
    transform: [{ rotate: '-34deg' }],
  },
  phone: {
    position: 'absolute',
    right: 8,
    top: 128,
    width: 38,
    height: 64,
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: 12,
    backgroundColor: '#fff',
    transform: [{ rotate: '-18deg' }],
    alignItems: 'center',
    paddingTop: 8,
  },
  phoneCamera: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111111',
  },
  logoSticker: {
    position: 'absolute',
    left: 18,
    bottom: 10,
    width: 58,
    height: 58,
    borderWidth: 4,
    borderColor: '#111111',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '-14deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 6, height: 6 },
    shadowRadius: 0,
  },
  logo: {
    width: 42,
    height: 42,
  },
});
