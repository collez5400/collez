import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialIcons } from '@expo/vector-icons';
import { useStreakStore } from '../../src/store/streakStore';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { RankRow } from '../../src/components/leaderboard/RankRow';
import { UserRankCard } from '../../src/components/leaderboard/UserRankCard';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { ErrorState } from '../../src/components/shared/ErrorState';
import { LeaderboardEntry, LeaderboardType, useLeaderboardStore } from '../../src/store/leaderboardStore';
import { useAuthStore } from '../../src/store/authStore';
import { useEventStore } from '../../src/store/eventStore';
import { shallow } from 'zustand/shallow';

export default function RankingsScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('college');
  const [refreshing, setRefreshing] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const { liveEvents, submitHuntResponse } = useEventStore(
    (state) => ({ liveEvents: state.liveEvents, submitHuntResponse: state.submitHuntResponse }),
    shallow
  );
  const triggerLeaderboardHiddenAction = useCallback(() => {
    const huntEvent = liveEvents.find((item) => item.event_type === 'treasure_hunt');
    if (!huntEvent) return;
    void submitHuntResponse({
      eventId: huntEvent.id,
      clueId: 'clue2',
      response: 'diwali_lamp',
    });
  }, [liveEvents, submitHuntResponse]);

  const {
    collegeBoard,
    cityBoard,
    stateBoard,
    nationalBoard,
    weeklyBoard,
    error,
    hasMoreCollege,
    hasMoreCity,
    hasMoreState,
    hasMoreNational,
    hasMoreWeekly,
    isLoading,
    fetchCollegeBoard,
    fetchCityBoard,
    fetchStateBoard,
    fetchNationalBoard,
    fetchWeeklyBoard,
    getUserRankSummary,
  } = useLeaderboardStore(
    (state) => ({
      collegeBoard: state.collegeBoard,
      cityBoard: state.cityBoard,
      stateBoard: state.stateBoard,
      nationalBoard: state.nationalBoard,
      weeklyBoard: state.weeklyBoard,
      error: state.error,
      hasMoreCollege: state.hasMoreCollege,
      hasMoreCity: state.hasMoreCity,
      hasMoreState: state.hasMoreState,
      hasMoreNational: state.hasMoreNational,
      hasMoreWeekly: state.hasMoreWeekly,
      isLoading: state.isLoading,
      fetchCollegeBoard: state.fetchCollegeBoard,
      fetchCityBoard: state.fetchCityBoard,
      fetchStateBoard: state.fetchStateBoard,
      fetchNationalBoard: state.fetchNationalBoard,
      fetchWeeklyBoard: state.fetchWeeklyBoard,
      getUserRankSummary: state.getUserRankSummary,
    }),
    shallow
  );

  useEffect(() => {
    void useStreakStore.getState().logStreakAction('leaderboard_view');
    void fetchCollegeBoard();
    void fetchCityBoard();
    void fetchStateBoard();
    void fetchNationalBoard();
    void fetchWeeklyBoard();
  }, [fetchCityBoard, fetchCollegeBoard, fetchNationalBoard, fetchStateBoard, fetchWeeklyBoard]);

  const data = useMemo<LeaderboardEntry[]>(() => {
    if (activeTab === 'college') return collegeBoard;
    if (activeTab === 'city') return cityBoard;
    if (activeTab === 'state') return stateBoard;
    if (activeTab === 'national') return nationalBoard;
    return weeklyBoard;
  }, [activeTab, cityBoard, collegeBoard, nationalBoard, stateBoard, weeklyBoard]);

  const hasMore = useMemo(() => {
    if (activeTab === 'college') return hasMoreCollege;
    if (activeTab === 'city') return hasMoreCity;
    if (activeTab === 'state') return hasMoreState;
    if (activeTab === 'national') return hasMoreNational;
    return hasMoreWeekly;
  }, [activeTab, hasMoreCity, hasMoreCollege, hasMoreNational, hasMoreState, hasMoreWeekly]);

  const xpLabel = activeTab === 'weekly' ? 'Weekly XP' : 'XP';
  const summary = getUserRankSummary(activeTab);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || isLoading) return;
    if (activeTab === 'college') await fetchCollegeBoard();
    if (activeTab === 'city') await fetchCityBoard();
    if (activeTab === 'state') await fetchStateBoard();
    if (activeTab === 'national') await fetchNationalBoard();
    if (activeTab === 'weekly') await fetchWeeklyBoard();
  }, [activeTab, fetchCityBoard, fetchCollegeBoard, fetchNationalBoard, fetchStateBoard, fetchWeeklyBoard, hasMore, isLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCollegeBoard({ refresh: true }),
        fetchCityBoard({ refresh: true }),
        fetchStateBoard({ refresh: true }),
        fetchNationalBoard({ refresh: true }),
        fetchWeeklyBoard({ refresh: true }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCityBoard, fetchCollegeBoard, fetchNationalBoard, fetchStateBoard, fetchWeeklyBoard]);

  const renderItem = useCallback(
    ({ item }: { item: LeaderboardEntry }) => (
      <RankRow
        entry={item}
        isCurrentUser={item.id === userId}
        showCollege={activeTab !== 'college'}
        xpLabel={xpLabel}
      />
    ),
    [activeTab, userId, xpLabel]
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
      <Pressable style={styles.hiddenTrigger} onPress={triggerLeaderboardHiddenAction}>
        <MaterialIcons name="emoji-objects" size={14} color={Colors.onSurfaceVariant} />
      </Pressable>
      <View style={styles.tabRow}>
        {tabButton('college', 'College')}
        {tabButton('city', 'City')}
        {tabButton('state', 'State')}
        {tabButton('national', 'National')}
        {tabButton('weekly', 'Weekly')}
      </View>
      <UserRankCard summary={summary} />
      {error ? <ErrorState message={error} onRetry={onRefresh} compact /> : null}
    </View>
  );

  const listFooter = !hasMore ? (
    <Text style={styles.footerText}>You reached the end of this leaderboard.</Text>
  ) : null;

  const listEmpty = !isLoading ? (
    <EmptyState
      icon="emoji-events"
      title="Leaderboard is warming up"
      description="No ranking data yet. Pull to refresh after users start earning XP."
      compact
    />
  ) : null;

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
  hiddenTrigger: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
    backgroundColor: `${Colors.surfaceHigh}66`,
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
