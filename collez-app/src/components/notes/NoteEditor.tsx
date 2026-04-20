import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../../config/theme';
import { GradientButton } from '../shared/GradientButton';
import { CreateNoteInput, Note } from '../../models/note';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SUBJECT_OPTIONS = ['General', 'Math', 'Physics', 'Chemistry', 'Biology', 'CS', 'English'];

interface NoteEditorProps {
  isVisible: boolean;
  initialNote?: Note;
  folders: { id: string; name: string }[];
  onSave: (payload: CreateNoteInput) => Promise<void>;
  onClose: () => void;
}

export default function NoteEditor({
  isVisible,
  initialNote,
  folders,
  onSave,
  onClose,
}: NoteEditorProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subjectTag, setSubjectTag] = useState<string>('General');
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [isPinned, setIsPinned] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTitle(initialNote?.title ?? '');
      setBody(initialNote?.body ?? '');
      setSubjectTag(initialNote?.subjectTag ?? 'General');
      setFolderId(initialNote?.folderId);
      setIsPinned(Boolean(initialNote?.isPinned));
      setShowFolderPicker(false);
      opacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 160 });
      return;
    }

    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 240 });
    opacity.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(resetForm)();
    });
  }, [initialNote, isVisible, opacity, translateY]);

  const resetForm = () => {
    setTitle('');
    setBody('');
    setSubjectTag('General');
    setFolderId(undefined);
    setIsPinned(false);
    setShowFolderPicker(false);
  };

  const closeSheet = () => {
    Keyboard.dismiss();
    onClose();
  };

  const selectedFolderName = useMemo(() => {
    if (!folderId) return 'No folder';
    return folders.find((folder) => folder.id === folderId)?.name ?? 'No folder';
  }, [folderId, folders]);

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSave({
      title: title.trim(),
      body: body.trim() || undefined,
      subjectTag: subjectTag.trim() || undefined,
      folderId,
      isPinned,
    });
    closeSheet();
  };

  const applyInline = (wrapper: '**' | '_') => {
    setBody((previous) => `${previous}${wrapper}${wrapper === '**' ? 'bold' : 'italic'}${wrapper}`);
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isVisible && translateY.value === SCREEN_HEIGHT) return null;

  return (
    <View style={styles.container} pointerEvents={isVisible ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={16} style={StyleSheet.absoluteFill} tint="dark" />
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={closeSheet} style={styles.headerIcon}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>{initialNote ? 'Edit Note' : 'New Note'}</Text>
          <TouchableOpacity onPress={() => setIsPinned((value) => !value)} style={styles.headerIcon}>
            <MaterialIcons
              name="push-pin"
              size={20}
              color={isPinned ? Colors.primary : Colors.outline}
              style={{ opacity: isPinned ? 1 : 0.5 }}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Note title"
          placeholderTextColor={Colors.outline}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.sectionLabel}>Subject Tag</Text>
        <View style={styles.subjectRow}>
          {SUBJECT_OPTIONS.map((subject) => {
            const isActive = subjectTag === subject;
            return (
              <TouchableOpacity
                key={subject}
                style={[styles.subjectChip, isActive && styles.subjectChipActive]}
                onPress={() => setSubjectTag(subject)}
              >
                <Text style={[styles.subjectChipText, isActive && styles.subjectChipTextActive]}>{subject}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Body</Text>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => applyInline('**')}>
            <Text style={styles.toolbarText}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => applyInline('_')}>
            <Text style={[styles.toolbarText, styles.toolbarItalic]}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={() => setBody((value) => `${value}\n- `)}>
            <MaterialIcons name="format-list-bulleted" size={16} color={Colors.onSurface} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.bodyInput}
          placeholder="Write your note..."
          placeholderTextColor={Colors.outline}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.folderButton}
          onPress={() => setShowFolderPicker((previous) => !previous)}
        >
          <MaterialIcons name="folder-open" size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.folderButtonText}>{selectedFolderName}</Text>
        </TouchableOpacity>

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

        <GradientButton
          title={initialNote ? 'Save Note' : 'Create Note'}
          onPress={() => void handleSave()}
          disabled={!title.trim()}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 120,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000077',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.92,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  title: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  titleInput: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginBottom: Spacing.sm,
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subjectChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    backgroundColor: Colors.surfaceLow,
  },
  subjectChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  subjectChipText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '600',
  },
  subjectChipTextActive: {
    color: Colors.primary,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  toolbarButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '700',
  },
  toolbarItalic: {
    fontStyle: 'italic',
  },
  bodyInput: {
    minHeight: 150,
    maxHeight: 220,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    backgroundColor: Colors.surfaceLow,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    marginBottom: Spacing.md,
  },
  folderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
  },
  folderButtonText: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginLeft: Spacing.sm,
  },
  folderList: {
    backgroundColor: Colors.surfaceLow,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
    maxHeight: 160,
    marginBottom: Spacing.md,
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
