import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { GradientButton } from '../shared/GradientButton';
import { TaskCategory } from '../../models/task';
import { useTaskStore } from '../../store/taskStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddTaskSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG: Array<{ id: TaskCategory; label: string; color: string }> = [
  { id: 'study', label: 'Study', color: Colors.primary },
  { id: 'personal', label: 'Personal', color: Colors.secondary },
  { id: 'college', label: 'College', color: Colors.warning },
];

const getIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AddTaskSheet({ isVisible, onClose }: AddTaskSheetProps) {
  const { addTask, folders } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const selectedFolderName = useMemo(() => {
    if (!folderId) return 'No folder';
    return folders.find((folder) => folder.id === folderId)?.name ?? 'No folder';
  }, [folderId, folders]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('study');
    setDueDate(new Date());
    setFolderId(undefined);
    setShowDatePicker(false);
    setShowFolderPicker(false);
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    await addTask({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      category,
      dueDate: dueDate ? getIsoDate(dueDate) : undefined,
      folderId,
    });
    closeSheet();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={closeSheet}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSheet} />

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add Task</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              placeholderTextColor={Colors.outline}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Description (optional)"
              placeholderTextColor={Colors.outline}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORY_CONFIG.map((item) => {
                const isActive = category === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoryChip,
                      isActive && { borderColor: item.color, backgroundColor: `${item.color}22` },
                    ]}
                    onPress={() => setCategory(item.id)}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDatePicker((prev) => !prev)}
              >
                <MaterialIcons name="event" size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.selectText}>
                  {dueDate ? getIsoDate(dueDate) : 'Set due date'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowFolderPicker((prev) => !prev)}
              >
                <MaterialIcons name="folder-open" size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.selectText} numberOfLines={1}>
                  {selectedFolderName}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker ? (
              <DateTimePicker
                mode="date"
                display="default"
                value={dueDate ?? new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            ) : null}

            {showFolderPicker ? (
              <View style={styles.folderList}>
                <TouchableOpacity
                  style={styles.folderOption}
                  onPress={() => {
                    setFolderId(undefined);
                    setShowFolderPicker(false);
                  }}
                >
                  <Text style={styles.folderText}>No folder</Text>
                </TouchableOpacity>

                {folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={styles.folderOption}
                    onPress={() => {
                      setFolderId(folder.id);
                      setShowFolderPicker(false);
                    }}
                  >
                    <Text style={styles.folderText}>{folder.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <GradientButton title="Save Task" onPress={handleSave} disabled={!title.trim()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000077',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#111111',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.outline,
    alignSelf: 'center',
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  form: {
    gap: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginBottom: -4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111111',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceLow,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    marginRight: 6,
  },
  categoryText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.onSurface,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  selectText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  folderList: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    maxHeight: 160,
  },
  folderOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outline}22`,
  },
  folderText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
});
