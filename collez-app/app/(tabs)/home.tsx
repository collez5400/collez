import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EventBanner } from '../../src/components/home/EventBanner';
import { LeaderboardMini } from '../../src/components/home/LeaderboardMini';
import { QuickActions } from '../../src/components/home/QuickActions';
import { QuoteCard } from '../../src/components/home/QuoteCard';
import { StatPills } from '../../src/components/home/StatPills';
import { TasksCard } from '../../src/components/home/TasksCard';
import { TimetableCard } from '../../src/components/home/TimetableCard';
import { ShimmerLoader } from '../../src/components/shared/ShimmerLoader';
import { AnimatedCard } from '../../src/components/shared/AnimatedCard';
import { AnimatedSection } from '../../src/components/shared/AnimatedSection';
import { TopAppBar } from '../../src/components/shared/TopAppBar';
import { ComicPanelCard } from '../../src/components/shared/ComicPanelCard';
import { MilestoneCelebrationModal } from '../../src/components/streak/MilestoneCelebrationModal';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { fetchTodayQuote } from '../../src/services/quoteService';
import { useOffline } from '../../src/hooks/useOffline';
import { useAuthStore } from '../../src/store/authStore';
import { useLeaderboardStore } from '../../src/store/leaderboardStore';
import { useStreakStore } from '../../src/store/streakStore';
import { useTaskStore } from '../../src/store/taskStore';
import { useTimetableStore } from '../../src/store/timetableStore';
import { useXpStore } from '../../src/store/xpStore';
import { useEventStore } from '../../src/store/eventStore';
import { useRemoteConfigStore } from '../../src/store/remoteConfigStore';
import { shallow } from 'zustand/shallow';
import { saveWidgetData } from '../../src/widgets/widgetData';
import { requestWidgetUpdate } from 'react-native-android-widget';

export default function HomeScreen() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const {
    streakCount,
    shields,
    shieldActive,
    activateStreakShield,
    fetchStreakData,
    logStreakAction,
    lastMilestone,
    clearLastMilestone,
    isStreakLoading,
  } = useStreakStore(
    (state) => ({
      streakCount: state.streakCount,
      shields: state.shields,
      shieldActive: state.shieldActive,
      activateStreakShield: state.activateStreakShield,
      fetchStreakData: state.fetchStreakData,
      logStreakAction: state.logStreakAction,
      lastMilestone: state.lastMilestone,
      clearLastMilestone: state.clearLastMilestone,
      isStreakLoading: state.isLoading,
    }),
    shallow
  );
  const { totalXp, rankTier, fetchXpData, isXpLoading } = useXpStore(
    (state) => ({
      totalXp: state.totalXp,
      rankTier: state.rankTier,
      fetchXpData: state.fetchXpData,
      isXpLoading: state.isLoading,
    }),
    shallow
  );
  const { fetchCollegeBoard } = useLeaderboardStore();
  const { liveEvents, fetchEvents } = useEventStore();
  const { entries, selectedDay, fetchEntries } = useTimetableStore();
  const { tasks, loadTasks } = useTaskStore();
  const [dailyQuote, setDailyQuote] = useState('Progress over perfection.');
  const [dailyQuoteAuthor, setDailyQuoteAuthor] = useState('COLLEZ');
  const [quoteLayoutVariant, setQuoteLayoutVariant] = useState<'A' | 'B'>('A');
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshRemoteConfig = useRemoteConfigStore((state) => state.refreshConfig);
  const getExperiment = useRemoteConfigStore((state) => state.getVariant);
  const isFeatureEnabled = useRemoteConfigStore((state) => state.isEnabled);
  const quoteLoggedRef = useRef(false);
  const prioritizedLiveEvent =
    liveEvents.find((event) => event.event_type === 'college_battle') ?? liveEvents[0] ?? null;
  const marathonTargetDays = prioritizedLiveEvent?.event_type === 'streak_marathon'
    ? Number((prioritizedLiveEvent.config as Record<string, unknown> | null)?.target_days ?? 30)
    : 30;
  const homeEvent = prioritizedLiveEvent
    ? {
        id: prioritizedLiveEvent.id,
        title:
          prioritizedLiveEvent.event_type === 'streak_marathon'
            ? `${prioritizedLiveEvent.title} • Day ${Math.min(streakCount, marathonTargetDays)}/${marathonTargetDays}`
            : prioritizedLiveEvent.title,
        imageUrl: prioritizedLiveEvent.banner_image_url ?? undefined,
        ctaLabel:
          prioritizedLiveEvent.event_type === 'college_battle'
            ? 'View Battle'
            : prioritizedLiveEvent.event_type === 'streak_marathon'
              ? 'Track Progress'
              : 'Join Now',
      }
    : null;
  const isOffline = useOffline();

  useEffect(() => {
    void fetchStreakData();
    void fetchXpData();
    void fetchCollegeBoard();
    void fetchEntries();
    void loadTasks();
    void fetchEvents();
  }, [fetchCollegeBoard, fetchEntries, fetchEvents, fetchStreakData, fetchXpData, loadTasks]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const dayEntries = entries[selectedDay] ?? [];
    const nextEntry = dayEntries[0];
    const nextClass = nextEntry
      ? `${nextEntry.subject} ${nextEntry.start_time}-${nextEntry.end_time}`
      : 'No class scheduled';

    void (async () => {
      try {
        await saveWidgetData({ streakCount, nextClass });
        await requestWidgetUpdate({
          widgetName: 'CollezOverview',
          renderWidget: async () => {
            const { CollezOverviewWidget } = await import('../../src/widgets/CollezOverviewWidget');
            const data = await import('../../src/widgets/widgetData').then((module) =>
              module.getWidgetData()
            );
            return <CollezOverviewWidget {...data} />;
          },
        });
      } catch {
        // Widget updates are best-effort in non-dev-client environments.
      }
    })();
  }, [entries, selectedDay, streakCount]);

  useEffect(() => {
    const loadQuote = async () => {
      setIsQuoteLoading(true);
      const quote = await fetchTodayQuote();
      setDailyQuote(quote.text);
      setDailyQuoteAuthor(quote.author);
      setIsQuoteLoading(false);
    };

    void loadQuote();
  }, []);

  useEffect(() => {
    if (!authUser) return;
    void (async () => {
      await refreshRemoteConfig();
      const variant = await getExperiment('home_quote_layout', authUser);
      if (variant === 'A' || variant === 'B') {
        setQuoteLayoutVariant(variant);
      }
    })();
  }, [authUser, getExperiment, refreshRemoteConfig]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchStreakData({ forceRefresh: true }),
      fetchXpData({ forceRefresh: true }),
      fetchCollegeBoard({ refresh: true }),
      fetchEntries(),
      loadTasks(),
      fetchEvents(),
      (async () => {
        const quote = await fetchTodayQuote({ forceRefresh: true });
        setDailyQuote(quote.text);
        setDailyQuoteAuthor(quote.author);
      })(),
    ]);
    setIsRefreshing(false);
  };

  const handleQuoteLayout = () => {
    if (quoteLoggedRef.current) return;
    quoteLoggedRef.current = true;
    void logStreakAction('quote_read');
  };

  return (
    <View style={styles.screen}>
      <TopAppBar
        avatarUrl={authUser?.avatar_url}
        xp={totalXp}
        onAvatarPress={() => router.push('/(tabs)/profile')}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
      >
        {isOffline && (
          <View style={styles.offlineBanner}>
            <MaterialIcons name="wifi-off" size={14} color={Colors.error} />
            <Text style={styles.offlineBannerText}>You're offline — showing cached data</Text>
          </View>
        )}

        <AnimatedCard index={0}>
          <ComicPanelCard style={styles.heroHeadlineCard}>
            <Text style={styles.heroHeadline}>WHAT&apos;S UP, HERO!</Text>
            <Text style={styles.heroSubline}>Level up your streak and crush today&apos;s missions.</Text>
          </ComicPanelCard>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <StatPills
            streak={streakCount}
            xp={totalXp}
            rank={rankTier.replace('_', ' ')}
            streakShieldCount={shields}
            streakShieldActive={shieldActive}
            onPressStreak={() => {
              if (shieldActive) {
                Alert.alert('Streak Shield active', 'Your next missed day is protected.');
                return;
              }
              if (shields > 0) {
                Alert.alert(
                  'Activate Streak Shield?',
                  'Use one shield to protect a single missed day. This works only for one-day gaps.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Activate',
                      onPress: () => {
                        void activateStreakShield();
                      },
                    },
                  ]
                );
                return;
              }
              router.push('/(tabs)/rankings');
            }}
            onPressXp={() => router.push('/(tabs)/rankings')}
            onPressRank={() => router.push('/(tabs)/rankings')}
          />
        </AnimatedCard>

        <EventBanner
          event={homeEvent}
          onJoin={() => {
            if (prioritizedLiveEvent?.event_type === 'college_battle') {
              router.push(`/events/battle/${prioritizedLiveEvent.id}`);
              return;
            }
            if (prioritizedLiveEvent?.event_type === 'streak_marathon') {
              router.push(`/events/marathon/${prioritizedLiveEvent.id}`);
              return;
            }
            router.push('/events');
          }}
        />

        <View style={styles.bentoRow}>
          <View style={styles.bentoWide}>
            <TimetableCard entries={entries[selectedDay] ?? []} onPress={() => router.push('/(tabs)/vault/timetable')} />
          </View>
          <View style={styles.bentoNarrow}>
            <LeaderboardMini />
          </View>
        </View>

        <View style={styles.bentoRow}>
          <View style={styles.bentoHalf}>
            <TasksCard tasks={tasks} onPress={() => router.push('/(tabs)/vault/tasks')} />
          </View>
          <View style={styles.bentoHalf}>
            {isQuoteLoading ? (
              <ShimmerLoader height={170} />
            ) : (
              <QuoteCard
                quote={quoteLayoutVariant === 'B' ? `"${dailyQuote}"` : dailyQuote}
                author={quoteLayoutVariant === 'B' ? `~ ${dailyQuoteAuthor}` : dailyQuoteAuthor}
                onViewed={handleQuoteLayout}
              />
            )}
          </View>
        </View>

        <AnimatedSection title="Quick Actions" index={7}>
          <QuickActions
            onAddTask={() => router.push('/(tabs)/vault/tasks')}
            onQuickNote={() => router.push('/(tabs)/vault/tasks')}
            onUploadPdf={() => router.push('/(tabs)/vault/pdfs')}
            onCustomize={() =>
              isFeatureEnabled('premium_themes_v2', authUser)
                ? router.push('/premium/themes')
                : Alert.alert('Customize', 'Theme customization is currently disabled for your cohort.')
            }
          />
        </AnimatedSection>

        {(isStreakLoading || isXpLoading) && (
          <View style={styles.loadingRow}>
            <ShimmerLoader width="32%" height={54} />
            <ShimmerLoader width="32%" height={54} />
            <ShimmerLoader width="32%" height={54} />
          </View>
        )}

        <TouchableOpacity style={styles.settingsShortcut} onPress={() => router.push('/settings')}>
          <MaterialIcons name="settings" size={16} color={Colors.primary} />
          <Text style={styles.settingsShortcutText}>Settings</Text>
        </TouchableOpacity>
      </ScrollView>

      <MilestoneCelebrationModal
        visible={Boolean(lastMilestone)}
        milestone={lastMilestone}
        onClose={clearLastMilestone}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  heroHeadlineCard: {
    padding: 20,
  },
  heroHeadline: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.headlineLg ?? 40,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colors.primary,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  heroSubline: {
    marginTop: 6,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.bodyMd ?? 16,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  offlineBannerText: {
    color: Colors.error,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  bentoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  bentoWide: {
    flex: 2,
    minHeight: 1,
  },
  bentoNarrow: {
    flex: 1,
    minHeight: 1,
  },
  bentoHalf: {
    flex: 1,
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingsShortcut: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
    shadowColor: '#110e05',
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 0,
  },
  settingsShortcutText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
});
