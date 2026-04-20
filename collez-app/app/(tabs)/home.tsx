import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../src/config/theme';
import { useStreakStore } from '../../src/store/streakStore';
import { StreakStatPill } from '../../src/components/home/StreakStatPill';
import { MilestoneCelebrationModal } from '../../src/components/streak/MilestoneCelebrationModal';

export default function HomeScreen() {
  const {
    streakCount,
    isLoggedToday,
    fetchStreakData,
    logStreakAction,
    lastMilestone,
    clearLastMilestone,
  } = useStreakStore();
  const quoteLoggedRef = useRef(false);

  useEffect(() => {
    void fetchStreakData();
  }, [fetchStreakData]);

  const handleQuoteLayout = () => {
    if (quoteLoggedRef.current) return;
    quoteLoggedRef.current = true;
    void logStreakAction('quote_read');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Cloud streak integration is active for Phase 1I.</Text>

        <StreakStatPill streakCount={streakCount} />

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Logged today</Text>
          <Text style={styles.infoValue}>{isLoggedToday ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.quoteCard} onLayout={handleQuoteLayout}>
          <Text style={styles.quoteLabel}>Daily quote preview</Text>
          <Text style={styles.quoteText}>
            "Progress over perfection."
          </Text>
        </View>
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
  quoteCard: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    padding: Spacing.md,
    minHeight: 120,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  quoteLabel: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  quoteText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    lineHeight: 24,
  },
});
