import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { useStreakStore } from '../../src/store/streakStore';
import { useXpStore } from '../../src/store/xpStore';
import { StreakStatPill } from '../../src/components/home/StreakStatPill';
import { XpStatPill } from '../../src/components/home/XpStatPill';
import { RankBadgePill } from '../../src/components/home/RankBadgePill';
import { XpProgressBar } from '../../src/components/home/XpProgressBar';
import { MilestoneCelebrationModal } from '../../src/components/streak/MilestoneCelebrationModal';
import { LeaderboardMini } from '../../src/components/home/LeaderboardMini';
import { useLeaderboardStore } from '../../src/store/leaderboardStore';
import { fetchTodayQuote } from '../../src/services/quoteService';
import { QuoteCard } from '../../src/components/home/QuoteCard';

export default function HomeScreen() {
  const {
    streakCount,
    isLoggedToday,
    fetchStreakData,
    logStreakAction,
    lastMilestone,
    clearLastMilestone,
  } = useStreakStore();
  const { totalXp, rankTier, rankProgress, xpNeededToNextRank, fetchXpData } = useXpStore();
  const { fetchCollegeBoard } = useLeaderboardStore();
  const [dailyQuote, setDailyQuote] = useState('Progress over perfection.');
  const [dailyQuoteAuthor, setDailyQuoteAuthor] = useState('COLLEZ');
  const quoteLoggedRef = useRef(false);

  useEffect(() => {
    void fetchStreakData();
    void fetchXpData();
    void fetchCollegeBoard();
  }, [fetchCollegeBoard, fetchStreakData, fetchXpData]);

  useEffect(() => {
    const loadQuote = async () => {
      const quote = await fetchTodayQuote();
      setDailyQuote(quote.text);
      setDailyQuoteAuthor(quote.author);
    };

    void loadQuote();
  }, []);

  const handleQuoteLayout = () => {
    if (quoteLoggedRef.current) return;
    quoteLoggedRef.current = true;
    void logStreakAction('quote_read');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Cloud streak, XP, and rank integration are active.</Text>

        <View style={styles.statsRow}>
          <StreakStatPill streakCount={streakCount} />
          <XpStatPill xp={totalXp} />
        </View>
        <RankBadgePill tier={rankTier} />
        <XpProgressBar progress={rankProgress} xpNeededToNextRank={xpNeededToNextRank} />
        <LeaderboardMini />

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Logged today</Text>
          <Text style={styles.infoValue}>{isLoggedToday ? 'Yes' : 'No'}</Text>
        </View>

        <QuoteCard quote={dailyQuote} author={dailyQuoteAuthor} onViewed={handleQuoteLayout} />
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
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xxl,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
    padding: Spacing.md,
    gap: 4,
  },
  infoLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  infoValue: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
});
