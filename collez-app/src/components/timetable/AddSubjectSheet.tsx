import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ColorLabel, TimetableEntry, DayOfWeek } from '../../models/timetable';
import { GradientButton } from '../shared/GradientButton';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddSubjectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Partial<TimetableEntry>) => void;
  editEntry?: TimetableEntry | null;
  selectedDay: DayOfWeek;
}

export const AddSubjectSheet: React.FC<AddSubjectSheetProps> = ({
  visible, onClose, onSave, editEntry, selectedDay,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState(new Date().setHours(9, 0, 0, 0));
  const [endTime, setEndTime] = useState(new Date().setHours(10, 0, 0, 0));
  const [color, setColor] = useState<ColorLabel>(ColorLabel.Primary);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editEntry) {
        setSubject(editEntry.subject);
        setRoom(editEntry.room || '');
        setColor(editEntry.color as ColorLabel);
        
        const sd = new Date();
        const [sh, sm] = editEntry.start_time.split(':');
        sd.setHours(Number(sh), Number(sm), 0, 0);
        setStartTime(sd.getTime());

        const ed = new Date();
        const [eh, em] = editEntry.end_time.split(':');
        ed.setHours(Number(eh), Number(em), 0, 0);
        setEndTime(ed.getTime());
      } else {
        setSubject('');
        setRoom('');
        setColor(ColorLabel.Primary);
      }
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(clearForm)();
      });
    }
  }, [visible, editEntry]);

  const clearForm = () => {
    setSubject('');
    setRoom('');
    setStartTime(new Date().setHours(9, 0, 0, 0));
    setEndTime(new Date().setHours(10, 0, 0, 0));
  };

  const handleSave = () => {
    if (!subject.trim()) return;
    
    const fmt = (ms: number) => {
      const d = new Date(ms);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    onSave({
      subject: subject.trim(),
      room: room.trim() ? room.trim() : undefined,
      start_time: fmt(startTime),
      end_time: fmt(endTime),
      color: color,
      day_of_week: selectedDay,
      sort_order: 0, 
    });
    Keyboard.dismiss();
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible && translateY.value === SCREEN_HEIGHT) return null;

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => { Keyboard.dismiss(); onClose(); }} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>{editEntry ? 'Edit Class' : 'Add Class'}</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Subject Name"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={subject}
            onChangeText={setSubject}
          />

          <TextInput
            style={styles.input}
            placeholder="Room (Optional)"
            placeholderTextColor={Colors.onSurfaceVariant}
            value={room}
            onChangeText={setRoom}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.timeBtn} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.timeLabel}>Start</Text>
              <Text style={styles.timeValue}>
                {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeBtn} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.timeLabel}>End</Text>
              <Text style={styles.timeValue}>
                {new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={new Date(startTime)}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(e, date) => {
                setShowStartPicker(false);
                if (date) setStartTime(date.getTime());
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={new Date(endTime)}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(e, date) => {
                setShowEndPicker(false);
                if (date) setEndTime(date.getTime());
              }}
            />
          )}

          <Text style={styles.colorTitle}>Color Theme</Text>
          <View style={styles.colorRow}>
            {Object.values(ColorLabel).map((hex) => (
              <TouchableOpacity
                key={hex}
                style={[styles.colorCircle, { backgroundColor: hex }, color === hex && styles.colorCircleActive]}
                onPress={() => setColor(hex as ColorLabel)}
              >
                {color === hex && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <GradientButton title="Save Class" onPress={handleSave} disabled={!subject.trim() || subject.trim().toLowerCase() === 'break'} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000066' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#111111',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.onSurfaceVariant, alignSelf: 'center', marginBottom: Spacing.md, opacity: 0.5,
  },
  title: {
    fontFamily: Typography.fontFamily.heading, fontSize: Typography.size.xl, color: Colors.onSurface, fontWeight: '700', marginBottom: Spacing.lg,
  },
  form: { gap: Spacing.md },
  input: {
    backgroundColor: Colors.surfaceLow,
    borderWidth: 3, borderColor: '#111111',
    borderRadius: BorderRadius.md, padding: Spacing.md,
    fontFamily: Typography.fontFamily.body, color: Colors.onSurface, fontSize: 16,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  timeBtn: {
    flex: 1, backgroundColor: Colors.surfaceLow, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 3, borderColor: '#111111',
  },
  timeLabel: { fontSize: 12, color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, marginBottom: 4 },
  timeValue: { fontSize: 16, color: Colors.onSurface, fontFamily: Typography.fontFamily.body, fontWeight: '600' },
  colorTitle: { fontSize: 14, color: Colors.onSurfaceVariant, fontFamily: Typography.fontFamily.body, marginTop: Spacing.sm },
  colorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorCircleActive: { borderWidth: 2, borderColor: Colors.surface, borderStyle: 'solid', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  check: { color: Colors.surface, fontSize: 20, fontWeight: '800' }
});
