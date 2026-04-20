import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useStreakStore } from '../../src/store/streakStore';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { RankRow } from '../../src/components/leaderboard/RankRow';
import { UserRankCard } from '../../src/components/leaderboard/UserRankCard';
import { LeaderboardEntry, LeaderboardType, useLeaderboardStore } from '../../src/store/leaderboardStore';
import { useAuthStore } from '../../src/store/authStore';

export default function RankingsScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('college');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const {
    collegeBoard,
    nationalBoard,
    weeklyBoard,
    error,
    hasMoreCollege,
    hasMoreNational,
    hasMoreWeekly,
    isLoading,
    fetchCollegeBoard,
    fetchNationalBoard,
    fetchWeeklyBoard,
    getUserRankSummary,
  } = useLeaderboardStore();

  useEffect(() => {
    void useStreakStore.getState().logStreakAction('leaderboard_view');
    void fetchCollegeBoard();
    void fetchNationalBoard();
    void fetchWeeklyBoard();
  }, [fetchCollegeBoard, fetchNationalBoard, fetchWeeklyBoard]);

  const data = useMemo<LeaderboardEntry[]>(() => {
    if (activeTab === 'college') return collegeBoard;
    if (activeTab === 'national') return nationalBoard;
    return weeklyBoard;
  }, [activeTab, collegeBoard, nationalBoard, weeklyBoard]);

  const hasMore = useMemo(() => {
    if (activeTab === 'college') return hasMoreCollege;
    if (activeTab === 'national') return hasMoreNational;
    return hasMoreWeekly;
  }, [activeTab, hasMoreCollege, hasMoreNational, hasMoreWeekly]);

  const xpLabel = activeTab === 'weekly' ? 'Weekly XP' : 'XP';
  const summary = getUserRankSummary(activeTab);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || isLoading) return;
    if (activeTab === 'college') await fetchCollegeBoard();
    if (activeTab === 'national') await fetchNationalBoard();
    if (activeTab === 'weekly') await fetchWeeklyBoard();
  }, [activeTab, fetchCollegeBoard, fetchNationalBoard, fetchWeeklyBoard, hasMore, isLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCollegeBoard({ refresh: true }),
        fetchNationalBoard({ refresh: true }),
        fetchWeeklyBoard({ refresh: true }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCollegeBoard, fetchNationalBoard, fetchWeeklyBoard]);

  const renderItem = useCallback(
    ({ item }: { item: LeaderboardEntry }) => (
      <RankRow
        entry={item}
        isCurrentUser={item.id === user?.id}
        showCollege={activeTab !== 'college'}
        xpLabel={xpLabel}
      />
    ),
    [activeTab, user?.id, xpLabel]
  );

  const keyExtractor = useCallback(
    (item: LeaderboardEntry) => `${activeTab}:${item.id}:${item.position}`,
    [activeTab]
  );

  const tabButton = (type: LeaderboardType, label: string) => (
    <Text
      key={type}
      style={[styles.tabPill, activeTab === type && styles.tabPillActive]}
      onPress={() => setActiveTab(type)}
    >
      {label}
    </Text>
  );

  const listHeader = (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Leaderboard</Text>
      <View style={styles.tabRow}>
        {tabButton('college', 'College')}
        {tabButton('national', 'National')}
        {tabButton('weekly', 'Weekly')}
      </View>
      <UserRankCard summary={summary} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const listFooter = !hasMore ? (
    <Text style={styles.footerText}>You reached the end of this leaderboard.</Text>
  ) : null;

  const listEmpty = !isLoading ? <Text style={styles.footerText}>No leaderboard data yet.</Text> : null;

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        onEndReachedThreshold={0.4}
        onEndReached={fetchNextPage}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerContainer: {
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xxl,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tabPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.outline}55`,
    backgroundColor: Colors.surface,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  tabPillActive: {
    borderColor: `${Colors.primary}88`,
    backgroundColor: `${Colors.primary}22`,
    color: Colors.primary,
  },
  errorText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  footerText: {
    textAlign: 'center',
    paddingVertical: Spacing.md,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
