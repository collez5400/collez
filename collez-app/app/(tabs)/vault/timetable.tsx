import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { DayOfWeek, TimetableEntry } from '../../../src/models/timetable';
import { useTimetableStore } from '../../../src/store/timetableStore';
import { AddSubjectSheet } from '../../../src/components/timetable/AddSubjectSheet';
import { EmptyState } from '../../../src/components/shared/EmptyState';
import { TopAppBar } from '../../../src/components/shared/TopAppBar';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/config/theme';
import { ComicPanelCard } from '../../../src/components/shared/ComicPanelCard';
import { useStreakStore } from '../../../src/store/streakStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';

const DAYS = [
  { id: DayOfWeek.Monday, label: 'Mon' },
  { id: DayOfWeek.Tuesday, label: 'Tue' },
  { id: DayOfWeek.Wednesday, label: 'Wed' },
  { id: DayOfWeek.Thursday, label: 'Thu' },
  { id: DayOfWeek.Friday, label: 'Fri' },
  { id: DayOfWeek.Saturday, label: 'Sat' },
];

const toMinutes = (value: string) => {
  const [hours, mins] = value.split(':').map(Number);
  return hours * 60 + mins;
};

function PulseBadge({
  label,
  backgroundColor,
  pulse,
}: {
  label: string;
  backgroundColor: string;
  pulse: boolean;
}) {
  const glow = useSharedValue(pulse ? 1 : 0.55);

  useEffect(() => {
    if (pulse) {
      glow.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
      return;
    }
    glow.value = withTiming(0.55, { duration: 160 });
  }, [glow, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.96 + glow.value * 0.08 }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.stateBadge, { backgroundColor }]}>
        <Text style={styles.stateBadgeText}>{label}</Text>
      </View>
    </Animated.View>
  );
}

export default function TimetableScreen() {
  const { entries, selectedDay, setSelectedDay, fetchEntries, addEntry, updateEntry, deleteEntry, reorderEntries, duplicateDay, resetSemester, generateWeekSlots } = useTimetableStore();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [periodMinutes, setPeriodMinutes] = useState('50');
  const [classStart, setClassStart] = useState('09:00');
  const [classEnd, setClassEnd] = useState('16:00');
  const [breakStart, setBreakStart] = useState('12:00');
  const [breakEnd, setBreakEnd] = useState('12:30');

  useEffect(() => {
    fetchEntries();
    void useStreakStore.getState().logStreakAction('timetable_view');
  }, []);

  const dayEntries = entries[selectedDay] || [];
  const hasAnyEntries = useMemo(() => Object.values(entries).some((list) => list.length > 0), [entries]);
  const currentMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, [dayEntries.length]);

  const handleSave = async (entry: Partial<TimetableEntry>) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, entry);
    } else {
      await addEntry({ ...entry, sort_order: dayEntries.length } as any);
    }
    setSheetVisible(false);
    setEditingEntry(null);
  };

  const handleDuplicate = () => {
    if (dayEntries.length === 0) return;
    Alert.alert('Duplicate Day', 'Which day should we copy these classes to?',
      DAYS.filter(d => d.id !== selectedDay).map(d => ({
        text: d.label,
        onPress: () => { duplicateDay(selectedDay, d.id); }
      } as const)).concat([{ text: 'Cancel', onPress: () => {} }])
    );
  };

  const handleGenerateWeek = async () => {
    const minutes = Number(periodMinutes);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      Alert.alert('Invalid period length', 'Enter a valid number of minutes.');
      return;
    }
    try {
      await generateWeekSlots({
        periodMinutes: minutes,
        classStart,
        classEnd,
        breakStart,
        breakEnd,
      });
      setIsGeneratorOpen(false);
    } catch (error: any) {
      Alert.alert('Could not generate timetable', error?.message ?? 'Please check your slot settings.');
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<TimetableEntry>) => {
    const startMinutes = toMinutes(item.start_time);
    const endMinutes = toMinutes(item.end_time);
    const isPast = endMinutes < currentMinutes;
    const isUpNext = startMinutes >= currentMinutes && startMinutes - currentMinutes <= 45;
    const isNow = startMinutes <= currentMinutes && endMinutes >= currentMinutes;
    const cardVariant = isNow ? styles.cardNow : isUpNext ? styles.cardUpNext : isPast ? styles.cardPast : styles.cardFuture;
    const badgeLabel = isNow ? 'LIVE' : isUpNext ? 'UP NEXT' : isPast ? 'DONE' : 'TODAY';
    const badgeTone = isNow || isUpNext ? Colors.primaryContainer : isPast ? Colors.surfaceContainerHighest : Colors.secondaryContainer;

    return (
      <TouchableOpacity
        style={[styles.cardWrap, { opacity: isActive ? 0.9 : 1 }]}
        onLongPress={drag}
        onPress={() => { setEditingEntry(item); setSheetVisible(true); }}
        delayLongPress={200}
      >
        <ComicPanelCard
          style={[styles.card, cardVariant, { backgroundColor: isActive ? Colors.surfaceHigh : Colors.surface, borderColor: `${item.color}55` }]}
          padding={0}
          dotColor={item.color}
          halftoneOpacity={0.08}
        >
          <View style={[styles.colorStrip, { backgroundColor: item.color as string }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.subject}>{item.subject}</Text>
              <PulseBadge label={badgeLabel} backgroundColor={badgeTone} pulse={isNow || isUpNext} />
            </View>
            <View style={styles.row}>
              <Text style={styles.time}>{item.start_time} - {item.end_time}</Text>
              {item.room && <Text style={styles.room}> • {item.room}</Text>}
            </View>
          </View>
          <TouchableOpacity style={styles.delBtn} onPress={() => deleteEntry(item.id)}>
            <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </ComicPanelCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <TopAppBar avatarUrl={user?.avatar_url} xp={user?.xp ?? 0} onAvatarPress={() => {}} />
      {/* Header actions */}
      <View style={styles.header}>
        <Text style={styles.title}>TIMETABLE</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setIsGeneratorOpen(true)} style={styles.actionBtn}>
            <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDuplicate} style={styles.actionBtn}>
            <MaterialIcons name="content-copy" size={20} color={Colors.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Reset Timetable', 'This will delete all classes for the entire semester. Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => resetSemester() }])} style={styles.actionBtn}>
            <MaterialIcons name="restart-alt" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ComicPanelCard style={styles.heroPanel} dotColor={Colors.primaryContainer} halftoneOpacity={0.12}>
        <Text style={styles.heroTitle}>CLASS MISSIONS</Text>
        <Text style={styles.heroSubTitle}>Pick a day chip, track your beat, and tap any card to edit.</Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={[styles.heroButton, styles.heroButtonPrimary]}
            onPress={() => { setEditingEntry(null); setSheetVisible(true); }}
          >
            <MaterialIcons name="add-circle-outline" size={16} color="#111111" />
            <Text style={styles.heroButtonPrimaryText}>Add Subject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroButton} onPress={() => setIsGeneratorOpen(true)}>
            <MaterialIcons name="event-available" size={16} color={Colors.primary} />
            <Text style={styles.heroButtonText}>Add Event Slot</Text>
          </TouchableOpacity>
        </View>
      </ComicPanelCard>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
        {DAYS.map(day => (
          <TouchableOpacity
            key={day.id}
            style={[styles.dayPill, selectedDay === day.id && styles.dayPillActive]}
            onPress={() => setSelectedDay(day.id)}
          >
            <Text style={[styles.dayLabel, selectedDay === day.id && styles.dayLabelActive]}>{day.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {dayEntries.length === 0 ? (
        <EmptyState
          icon="event-busy"
          title="No classes today"
          description="Enjoy the break or add your next class."
        />
      ) : (
        <DraggableFlatList
          data={dayEntries}
          onDragEnd={({ data }) => reorderEntries(selectedDay, data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 72 }]}
        onPress={() => { setEditingEntry(null); setSheetVisible(true); }}
      >
        <MaterialIcons name="add" size={28} color={Colors.surface} />
      </TouchableOpacity>

      <AddSubjectSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
        editEntry={editingEntry}
        selectedDay={selectedDay}
      />

      <Modal visible={isGeneratorOpen} animationType="slide" transparent onRequestClose={() => setIsGeneratorOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <Text style={styles.modalTitle}>Auto-generate Week Slots</Text>
            <Text style={styles.modalSub}>Mon-Sat slots will be created first. Tap a slot later to add subjects.</Text>

            <TextInput style={styles.input} value={periodMinutes} onChangeText={setPeriodMinutes} keyboardType="numeric" placeholder="Each period (minutes)" placeholderTextColor={Colors.onSurfaceVariant} />
            <TextInput style={styles.input} value={classStart} onChangeText={setClassStart} placeholder="Class starts at (HH:MM)" placeholderTextColor={Colors.onSurfaceVariant} />
            <TextInput style={styles.input} value={classEnd} onChangeText={setClassEnd} placeholder="Class ends at (HH:MM)" placeholderTextColor={Colors.onSurfaceVariant} />
            <TextInput style={styles.input} value={breakStart} onChangeText={setBreakStart} placeholder="Break starts (HH:MM)" placeholderTextColor={Colors.onSurfaceVariant} />
            <TextInput style={styles.input} value={breakEnd} onChangeText={setBreakEnd} placeholder="Break ends (HH:MM)" placeholderTextColor={Colors.onSurfaceVariant} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsGeneratorOpen(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (hasAnyEntries) {
                    Alert.alert('Replace existing timetable?', 'This will replace all current classes for Mon-Sat.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Replace', style: 'destructive', onPress: () => { void handleGenerateWeek(); } },
                    ]);
                    return;
                  }
                  void handleGenerateWeek();
                }}
              >
                <Text style={styles.primaryBtnText}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, marginTop: Spacing.sm },
  title: {
    fontSize: Typography.size.displayHero ?? 72,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.primary,
    fontWeight: '900',
    textShadowColor: '#111111',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    padding: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: '#111111',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
  },
  heroPanel: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 3,
    borderColor: '#111111',
    gap: Spacing.xs,
  },
  heroTitle: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroSubTitle: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  heroButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroButtonPrimary: { backgroundColor: Colors.primaryContainer },
  heroButtonText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroButtonPrimaryText: {
    color: '#111111',
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  daysScroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs, maxHeight: 50 },
  dayPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 3,
    borderColor: '#111111',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
  },
  dayPillActive: { backgroundColor: Colors.primaryContainer, borderColor: '#111111', shadowOffset: { width: 5, height: 5 } },
  dayLabel: { fontSize: 13, fontFamily: Typography.fontFamily.body, color: Colors.onSurfaceVariant, fontWeight: '600' },
  dayLabelActive: { color: Colors.onPrimary, fontFamily: Typography.fontFamily.button, textTransform: 'uppercase' },
  list: { padding: Spacing.md, paddingBottom: 100, gap: Spacing.md },
  cardWrap: {
    height: 96,
  },
  card: {
    height: '100%',
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#111111',
    alignItems: 'center',
  },
  cardPast: { opacity: 0.8 },
  cardUpNext: { backgroundColor: `${Colors.primaryContainer}22` },
  cardNow: { backgroundColor: `${Colors.primaryContainer}3d` },
  cardFuture: { backgroundColor: Colors.surface },
  colorStrip: { width: 6, height: '100%' },
  cardContent: { flex: 1, paddingHorizontal: Spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  subject: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.heading,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
    flex: 1,
  },
  stateBadge: {
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stateBadgeText: {
    color: '#111111',
    fontSize: 10,
    fontFamily: Typography.fontFamily.button,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  time: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.button,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  room: { fontSize: 12, fontFamily: Typography.fontFamily.body, color: Colors.primary },
  delBtn: { padding: Spacing.md },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl + 40,
    right: Spacing.md,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#111111',
    shadowColor: '#111111',
    shadowOpacity: 1,
    shadowOffset: { width: 6, height: 6 },
    shadowRadius: 0,
  },
  modalBackdrop: { flex: 1, backgroundColor: '#00000077', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#111111',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalTitle: { fontSize: Typography.size.lg, fontFamily: Typography.fontFamily.heading, color: Colors.onSurface, fontWeight: '700' },
  modalSub: { fontSize: Typography.size.sm, fontFamily: Typography.fontFamily.body, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surfaceLow, borderWidth: 3, borderColor: '#111111', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, color: Colors.onSurface, fontFamily: Typography.fontFamily.body },
  modalButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  secondaryBtn: { flex: 1, borderWidth: 3, borderColor: '#111111', borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: Colors.surfaceContainerHigh },
  secondaryBtnText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontWeight: '600' },
  primaryBtn: { flex: 1, backgroundColor: Colors.primaryContainer, borderWidth: 3, borderColor: '#111111', borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  primaryBtnText: { color: '#111111', fontFamily: Typography.fontFamily.body, fontWeight: '700' },
});
