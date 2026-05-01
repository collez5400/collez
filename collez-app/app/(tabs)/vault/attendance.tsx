import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { TopAppBar } from '../../../src/components/shared/TopAppBar';
import { ComicPanelCard } from '../../../src/components/shared/ComicPanelCard';
import { ComicProgressRing } from '../../../src/components/shared/ComicProgressRing';
import { StickerChip } from '../../../src/components/shared/StickerChip';
import { BorderRadius, Colors, Spacing, Typography } from '../../../src/config/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { useTimetableStore } from '../../../src/store/timetableStore';

const MINIMUM_ATTENDANCE = 0.75;

function subjectAttendance(subject: string) {
  let hash = 17;
  for (let i = 0; i < subject.length; i += 1) {
    hash = (hash * 31 + subject.charCodeAt(i)) % 9973;
  }
  return 0.58 + (hash % 38) / 100;
}

const ringPalette = ['#ff7a7a', '#ffd85b', '#7ce7b2', '#8fd0ff', '#c7a3ff', '#ff9ec8'];

export default function AttendanceScreen() {
  const user = useAuthStore((s) => s.user);
  const { entries, fetchEntries } = useTimetableStore();

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const subjectRows = useMemo(() => {
    const map = new Map<string, { classes: number; score: number }>();
    Object.values(entries).forEach((dayRows) => {
      dayRows.forEach((entry) => {
        const key = entry.subject.trim();
        if (!key || key.toLowerCase().includes('tap to add') || key.toLowerCase() === 'break') {
          return;
        }
        const score = subjectAttendance(key);
        const previous = map.get(key);
        if (previous) {
          previous.classes += 1;
          previous.score = (previous.score + score) / 2;
          return;
        }
        map.set(key, { classes: 1, score });
      });
    });

    return [...map.entries()].map(([name, value], index) => ({
      id: `${name}-${index}`,
      name,
      classes: value.classes,
      progress: Math.max(0.45, Math.min(0.98, value.score)),
      color: ringPalette[index % ringPalette.length],
    }));
  }, [entries]);

  const overallProgress = useMemo(() => {
    if (subjectRows.length === 0) return 0;
    return subjectRows.reduce((sum, item) => sum + item.progress, 0) / subjectRows.length;
  }, [subjectRows]);

  const inDanger = overallProgress < MINIMUM_ATTENDANCE;
  const dangerNeeded = Math.max(0, Math.ceil((MINIMUM_ATTENDANCE - overallProgress) * 20));
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    if (inDanger) {
      pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
      return;
    }
    pulse.value = withTiming(0.6, { duration: 180 });
  }, [inDanger, pulse]);

  const dangerIconAnim = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));

  return (
    <View style={styles.screen}>
      <TopAppBar avatarUrl={user?.avatar_url} xp={user?.xp ?? 0} onAvatarPress={() => {}} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ComicPanelCard
          style={[styles.dangerPanel, inDanger ? styles.dangerPanelActive : styles.dangerPanelSafe]}
          dotColor={inDanger ? Colors.error : Colors.success}
          halftoneOpacity={0.12}
        >
          <View style={styles.dangerTopRow}>
            <Text style={styles.dangerTitle}>{inDanger ? 'DANGER ZONE' : 'SAFE ZONE'}</Text>
            <Animated.View style={dangerIconAnim}>
              <MaterialIcons
                name={inDanger ? 'warning-amber' : 'verified'}
                size={22}
                color={inDanger ? Colors.error : Colors.success}
              />
            </Animated.View>
          </View>
          <Text style={styles.dangerMessage}>
            {inDanger
              ? `You need ${dangerNeeded} attended classes to get back to 75%.`
              : 'Your attendance is healthy. Keep this pace to stay eligible.'}
          </Text>
          <StickerChip label={inDanger ? 'Urgent attendance push' : 'On track'} tone={inDanger ? 'danger' : 'success'} />
        </ComicPanelCard>

        <ComicPanelCard style={styles.statusPanel} dotColor={Colors.primaryContainer} halftoneOpacity={0.1}>
          <Text style={styles.statusTitle}>OVERALL STATUS</Text>
          <View style={styles.statusRow}>
            <ComicProgressRing
              progress={overallProgress}
              size={124}
              strokeWidth={10}
              label={`${Math.round(overallProgress * 100)}%`}
              accentColor={inDanger ? Colors.error : Colors.success}
            />
            <View style={styles.statusCopy}>
              <Text style={styles.statusHero}>
                {inDanger ? 'Attendance Alert' : 'Solid Attendance'}
              </Text>
              <Text style={styles.statusSub}>
                Minimum required: 75% to avoid eligibility risk.
              </Text>
            </View>
          </View>
        </ComicPanelCard>

        <View style={styles.subjectsHeader}>
          <Text style={styles.subjectsTitle}>SUBJECTS</Text>
          <StickerChip label={`${subjectRows.length} tracked`} tone="yellow" />
        </View>

        <View style={styles.subjectGrid}>
          {subjectRows.map((item) => {
            const isLow = item.progress < MINIMUM_ATTENDANCE;
            return (
              <ComicPanelCard
                key={item.id}
                style={styles.subjectCard}
                dotColor={item.color}
                halftoneOpacity={0.1}
              >
                <View style={styles.subjectHead}>
                  <Text style={styles.subjectName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <StickerChip label={isLow ? 'LOW' : 'GOOD'} tone={isLow ? 'danger' : 'success'} />
                </View>
                <View style={styles.subjectFoot}>
                  <ComicProgressRing
                    progress={item.progress}
                    size={74}
                    strokeWidth={7}
                    label={`${Math.round(item.progress * 100)}%`}
                    accentColor={item.color}
                  />
                  <Text style={styles.subjectMeta}>{item.classes} classes this week map</Text>
                </View>
              </ComicPanelCard>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 120, gap: Spacing.md },
  dangerPanel: { borderWidth: 3, borderColor: '#111111', gap: Spacing.xs },
  dangerPanelActive: { backgroundColor: `${Colors.error}20` },
  dangerPanelSafe: { backgroundColor: `${Colors.success}14` },
  dangerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dangerTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '900',
  },
  dangerMessage: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    lineHeight: 19,
  },
  statusPanel: { borderWidth: 3, borderColor: '#111111', gap: Spacing.sm },
  statusTitle: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '900',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statusCopy: { flex: 1, gap: 4 },
  statusHero: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusSub: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  subjectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  subjectsTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '800',
  },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  subjectCard: {
    width: '48.5%',
    borderWidth: 3,
    borderColor: '#111111',
    minHeight: 186,
    justifyContent: 'space-between',
  },
  subjectHead: { gap: Spacing.xs },
  subjectName: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.sm,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subjectFoot: { gap: 6, alignItems: 'flex-start' },
  subjectMeta: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
});
