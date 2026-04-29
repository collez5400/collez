import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '../../config/theme';
import { StickerChip } from './StickerChip';
import { HardShadowBox } from './HardShadowBox';

interface TopAppBarProps {
  avatarUrl?: string | null;
  xp?: number;
  onAvatarPress?: () => void;
}

export function TopAppBar({ avatarUrl, xp = 0, onAvatarPress }: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <HardShadowBox shadowOffset={4}>
      <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={styles.row}>
          <Pressable style={styles.avatarButton} onPress={onAvatarPress}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <MaterialIcons name="person" size={20} color="#111111" />
              </View>
            )}
          </Pressable>
          <Text style={styles.brand}>COLLEZ</Text>
          <StickerChip label={`${Math.max(0, Math.round(xp))} XP`} tone="yellow" style={styles.xpPill} />
        </View>
      </View>
    </HardShadowBox>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.primaryContainer,
    borderBottomWidth: 4,
    borderBottomColor: '#111111',
  },
  row: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#111111',
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  avatar: { width: '100%', height: '100%' },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: '#111111',
    letterSpacing: 0.4,
  },
  xpPill: {
    minWidth: 88,
    alignItems: 'center',
  },
});
