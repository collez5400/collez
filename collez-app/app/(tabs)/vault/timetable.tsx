import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { DayOfWeek, TimetableEntry } from '../../../src/models/timetable';
import { useTimetableStore } from '../../../src/store/timetableStore';
import { AddSubjectSheet } from '../../../src/components/timetable/AddSubjectSheet';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/config/theme';
import { useStreakStore } from '../../../src/store/streakStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DAYS = [
  { id: DayOfWeek.Monday, label: 'Mon' },
  { id: DayOfWeek.Tuesday, label: 'Tue' },
  { id: DayOfWeek.Wednesday, label: 'Wed' },
  { id: DayOfWeek.Thursday, label: 'Thu' },
  { id: DayOfWeek.Friday, label: 'Fri' },
  { id: DayOfWeek.Saturday, label: 'Sat' },
];

export default function TimetableScreen() {
  const { entries, selectedDay, setSelectedDay, fetchEntries, addEntry, updateEntry, deleteEntry, reorderEntries, duplicateDay, resetSemester, generateWeekSlots } = useTimetableStore();
  const insets = useSafeAreaInsets();
  
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
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isActive ? Colors.surfaceHigh : Colors.surface, borderColor: `${item.color}55` }]}
        onLongPress={drag}
        onPress={() => { setEditingEntry(item); setSheetVisible(true); }}
        delayLongPress={200}
      >
        <View style={[styles.colorStrip, { backgroundColor: item.color as string }]} />
        <View style={styles.cardContent}>
          <Text style={styles.subject}>{item.subject}</Text>
          <View style={styles.row}>
            <Text style={styles.time}>{item.start_time} - {item.end_time}</Text>
            {item.room && <Text style={styles.room}> • {item.room}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.delBtn} onPress={() => deleteEntry(item.id)}>
          <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header actions */}
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
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
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>😴</Text>
          <Text style={styles.emptyText}>No classes today.</Text>
          <Text style={styles.emptySub}>Enjoy the break or add a class.</Text>
        </View>
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
  title: { fontSize: Typography.size.xl, fontFamily: Typography.fontFamily.heading, color: Colors.onSurface, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: 8, backgroundColor: Colors.surfaceLow, borderRadius: BorderRadius.full },
  daysScroll: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs, maxHeight: 44 },
  dayPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLow, borderWidth: 1, borderColor: `${Colors.outline}33` },
  dayPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayLabel: { fontSize: 13, fontFamily: Typography.fontFamily.body, color: Colors.onSurfaceVariant, fontWeight: '600' },
  dayLabelActive: { color: Colors.background },
  list: { padding: Spacing.md, paddingBottom: 100, gap: Spacing.md },
  card: { height: 76, flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, alignItems: 'center' },
  colorStrip: { width: 6, height: '100%' },
  cardContent: { flex: 1, paddingHorizontal: Spacing.md },
  subject: { fontSize: 16, fontFamily: Typography.fontFamily.body, fontWeight: '700', color: Colors.onSurface, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  time: { fontSize: 12, fontFamily: Typography.fontFamily.body, color: Colors.onSurfaceVariant },
  room: { fontSize: 12, fontFamily: Typography.fontFamily.body, color: Colors.primary },
  delBtn: { padding: Spacing.md },
  fab: { position: 'absolute', bottom: Spacing.xl + 40, right: Spacing.md, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.glass, elevation: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.sm },
  emptyText: { fontSize: 18, fontFamily: Typography.fontFamily.heading, color: Colors.onSurface, fontWeight: '700' },
  emptySub: { fontSize: 14, fontFamily: Typography.fontFamily.body, color: Colors.onSurfaceVariant, marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: '#00000077', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.sm },
  modalTitle: { fontSize: Typography.size.lg, fontFamily: Typography.fontFamily.heading, color: Colors.onSurface, fontWeight: '700' },
  modalSub: { fontSize: Typography.size.sm, fontFamily: Typography.fontFamily.body, color: Colors.onSurfaceVariant, marginBottom: Spacing.sm },
  input: { backgroundColor: Colors.surfaceLow, borderWidth: 1, borderColor: `${Colors.outline}44`, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, color: Colors.onSurface, fontFamily: Typography.fontFamily.body },
  modalButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: `${Colors.outline}66`, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  secondaryBtnText: { color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, fontWeight: '600' },
  primaryBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  primaryBtnText: { color: Colors.background, fontFamily: Typography.fontFamily.body, fontWeight: '700' },
});
