import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Typography } from '../../config/theme';
import { StickerChip } from './StickerChip';
import { HardShadowBox } from './HardShadowBox';

interface PodiumEntry {
  rank: 1 | 2 | 3;
  label: string;
  score: string;
  tone?: 'yellow' | 'purple' | 'dark';
}

interface ComicPodiumProps {
  entries?: [PodiumEntry, PodiumEntry, PodiumEntry];
  style?: ViewStyle;
}

const DEFAULT_ENTRIES: [PodiumEntry, PodiumEntry, PodiumEntry] = [
  { rank: 2, label: 'Crew', score: '850 XP', tone: 'purple' },
  { rank: 1, label: 'You', score: '1200 XP', tone: 'yellow' },
  { rank: 3, label: 'Rivals', score: '600 XP', tone: 'dark' },
];

const HEIGHTS: Record<1 | 2 | 3, number> = { 1: 200, 2: 140, 3: 100 };

export function ComicPodium({ entries = DEFAULT_ENTRIES, style }: ComicPodiumProps) {
  const ordered = [...entries].sort((a, b) => {
    const order = { 2: 0, 1: 1, 3: 2 };
    return order[a.rank] - order[b.rank];
  });

  return (
    <View style={[styles.wrap, style]}>
      {ordered.map((entry) => {
        const isCenter = entry.rank === 1;
        return (
          <View
            key={`${entry.rank}-${entry.label}`}
            style={[
              styles.column,
              entry.rank === 2 && styles.leftCol,
              entry.rank === 3 && styles.rightCol,
            ]}
          >
            <HardShadowBox shadowOffset={4} borderRadius={isCenter ? 37 : 29}>
              <View style={[styles.avatar, isCenter && styles.avatarCenter]}>
                <Text style={[styles.avatarText, isCenter && styles.avatarTextCenter]}>
                  {entry.label.slice(0, 1)}
                </Text>
              </View>
            </HardShadowBox>
            <StickerChip
              label={entry.score}
              tone={entry.tone ?? (isCenter ? 'yellow' : 'purple')}
              style={isCenter ? styles.scoreChipCenter : styles.scoreChip}
            />
            <HardShadowBox shadowOffset={6} borderRadius={16}>
              <View
                style={[
                  styles.block,
                  { height: HEIGHTS[entry.rank] },
                  entry.rank === 1 && styles.blockCenter,
                  entry.rank === 2 && styles.blockLeft,
                  entry.rank === 3 && styles.blockRight,
                ]}
              >
                <Text style={[styles.rank, isCenter && styles.rankCenter]}>{entry.rank}</Text>
              </View>
            </HardShadowBox>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 300,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 14,
  },
  column: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leftCol: {
    marginBottom: 16,
  },
  rightCol: {
    marginBottom: 48,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHighest,
    marginBottom: -14,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCenter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.primaryContainer,
  },
  avatarText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  avatarTextCenter: {
    color: '#111111',
    fontSize: 30,
  },
  scoreChip: {
    zIndex: 4,
    marginBottom: 6,
    transform: [{ rotate: '-4deg' }],
  },
  scoreChipCenter: {
    zIndex: 4,
    marginBottom: 6,
    transform: [{ rotate: '3deg' }],
  },
  block: {
    width: 86,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 4,
    borderColor: '#111111',
    alignItems: 'center',
  },
  blockLeft: {
    backgroundColor: Colors.secondaryContainer,
  },
  blockCenter: {
    width: 98,
    backgroundColor: Colors.primaryContainer,
  },
  blockRight: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  rank: {
    marginTop: 10,
    color: Colors.onSecondaryContainer,
    fontFamily: Typography.fontFamily.heading,
    fontSize: 30,
    fontWeight: '900',
  },
  rankCenter: {
    color: '#111111',
    fontSize: 54,
  },
});
