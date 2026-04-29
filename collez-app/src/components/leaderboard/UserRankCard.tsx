import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../config/theme';
import { LeaderboardType, UserRankSummary } from '../../store/leaderboardStore';
import { ComicPanelCard } from '../shared/ComicPanelCard';
import { StickerChip } from '../shared/StickerChip';

interface UserRankCardProps {
  summary: UserRankSummary | null;
}

const getTypeLabel = (type: LeaderboardType): string => {
  if (type === 'college') return 'College';
  if (type === 'city') return 'City';
  if (type === 'state') return 'State';
  if (type === 'national') return 'National';
  return 'Weekly';
};

export function UserRankCard({ summary }: UserRankCardProps) {
  if (!summary) return null;

  return (
    <ComicPanelCard style={styles.container} padding={16}>
      <View style={styles.header}>
        <MaterialIcons name="military-tech" size={18} color={Colors.primary} />
        <Text style={styles.headerText}>Your {getTypeLabel(summary.type)} Rank</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.rankValue}>{summary.rank ? `#${summary.rank}` : 'Unranked'}</Text>
        <View style={styles.metaGroup}>
          <StickerChip
            label={`${summary.type === 'weekly' ? summary.weeklyXp ?? 0 : summary.xp} ${summary.type === 'weekly' ? 'weekly xp' : 'xp'}`}
            tone="yellow"
          />
          {summary.collegeName ? <Text style={styles.metaText}>{summary.collegeName}</Text> : null}
        </View>
      </View>
    </ComicPanelCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankValue: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  metaGroup: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metaText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});
