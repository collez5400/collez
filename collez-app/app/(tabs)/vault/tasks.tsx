// app/(tabs)/vault/tasks.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTaskStore } from '../../../src/store/taskStore';
import { Task, TaskCategory } from '../../../src/models/task';
import { BorderRadius, Colors, Spacing, Typography } from '../../../src/config/theme';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { FlashList } from '@shopify/flash-list';
import AddTaskSheet from '../../../src/components/tasks/AddTaskSheet';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { EmptyState } from '../../../src/components/shared/EmptyState';
import { TopAppBar } from '../../../src/components/shared/TopAppBar';
import { ComicProgressRing } from '../../../src/components/shared/ComicProgressRing';
import { ComicPanelCard } from '../../../src/components/shared/ComicPanelCard';
import { StickerChip } from '../../../src/components/shared/StickerChip';
import { useNoteStore } from '../../../src/store/noteStore';
import { Note, NoteSortOption, NoteTab } from '../../../src/models/note';
import NoteEditor from '../../../src/components/notes/NoteEditor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { HardShadowBox } from '../../../src/components/shared/HardShadowBox';

const CATEGORIES: (TaskCategory | 'all')[] = ['all', 'study', 'personal', 'college'];
const STROKE_WIDTH = 6;
const NOTE_TABS: NoteTab[] = ['all', 'pinned', 'subjects'];
const NOTE_SORTS: NoteSortOption[] = ['date', 'subject', 'pinned'];

const getCategoryColor = (category: TaskCategory) => {
  switch (category) {
    case 'study':
      return Colors.primary;
    case 'personal':
      return Colors.secondary;
    case 'college':
      return Colors.warning;
    default:
      return Colors.outline;
  }
};

const CategoryPill = ({
  category,
  active,
  onPress,
}: {
  category: TaskCategory | 'all';
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.pill,
      active && styles.pillActive,
    ]}
  >
    <Text style={[
      styles.pillText,
      active && styles.pillTextActive,
    ]}>
      {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
    </Text>
  </TouchableOpacity>
);

const TaskItem = ({
  task,
  onToggle,
  onPin,
  onArchive,
  onUnarchive,
  onMoveTask,
  onDelete,
  folders,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onMoveTask: (taskId: string, folderId?: string) => void;
  onDelete: (id: string) => void;
  folders: { id: string; name: string }[];
}) => {
  const categoryColor = useMemo(() => getCategoryColor(task.category), [task.category]);
  const folderName = useMemo(
    () => folders.find((folder) => folder.id === task.folderId)?.name,
    [folders, task.folderId]
  );

  const handleMove = () => {
    Alert.alert(
      'Move Task',
      'Select destination folder',
      [
        { text: 'No folder', onPress: () => onMoveTask(task.id, undefined) },
        ...folders.map((folder) => ({
          text: folder.name,
          onPress: () => onMoveTask(task.id, folder.id),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.taskContainer}>
      <ComicPanelCard
        style={[
          styles.taskCard,
          { opacity: task.isCompleted ? 0.6 : 1 },
          { borderLeftWidth: 4, borderLeftColor: categoryColor },
        ]}
        padding={16}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => onToggle(task.id)}
        >
          <MaterialIcons
            name={task.isCompleted ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color={task.isCompleted ? Colors.success : Colors.outline}
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text 
            style={[
              styles.taskTitle,
              task.isCompleted && styles.taskTitleCompleted
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text 
              style={styles.taskDesc} 
              numberOfLines={1}
            >
              {task.description}
            </Text>
          ) : null}

          <View style={styles.taskMeta}>
            <StickerChip label={task.category} tone="dark" style={styles.categoryBadge} />

            {task.dueDate && (
              <View style={styles.dueContainer}>
                <MaterialIcons name="event" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.dueText}>{task.dueDate}</Text>
              </View>
            )}
            <View style={styles.folderContainer}>
              <MaterialIcons name="schedule" size={14} color={Colors.onSurfaceVariant} />
              <Text style={styles.dueText}>{task.createdAt.slice(0, 10)}</Text>
            </View>

            {folderName ? (
              <View style={styles.folderContainer}>
                <MaterialIcons name="folder" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.dueText}>{folderName}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.taskActions}>
          <TouchableOpacity onPress={() => onPin(task.id)} style={styles.iconAction}>
            <MaterialIcons
              name="push-pin"
              size={20}
              color={task.isPinned ? Colors.primary : Colors.outline}
              style={{ opacity: task.isPinned ? 1 : 0.3 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleMove} style={styles.iconAction}>
            <MaterialIcons name="drive-file-move" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>

          {task.isArchived ? (
            <TouchableOpacity onPress={() => onUnarchive(task.id)} style={styles.iconAction}>
              <MaterialIcons name="unarchive" size={20} color={Colors.warning} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => onArchive(task.id)} style={styles.iconAction}>
              <MaterialIcons name="archive" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.iconAction}>
            <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </ComicPanelCard>
    </View>
  );
};

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const {
    tasks,
    folders,
    loadTasks,
    loadFolders,
    addFolder,
    renameFolder,
    deleteFolder,
    moveTask,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    activeFolderId,
    setActiveFolderId,
    showArchived,
    setShowArchived,
    toggleComplete,
    togglePin,
    archiveTask,
    unarchiveTask,
    deleteTask,
    isLoading,
  } = useTaskStore();
  const {
    notes,
    folders: noteFolders,
    loadNotes,
    loadFolders: loadNoteFolders,
    addNote,
    updateNote,
    deleteNote,
    togglePin: toggleNotePin,
    archiveNote,
    unarchiveNote,
    addFolder: addNoteFolder,
    renameFolder: renameNoteFolder,
    deleteFolder: deleteNoteFolder,
    activeTab: activeNoteTab,
    setActiveTab: setActiveNoteTab,
    searchQuery: noteSearchQuery,
    setSearchQuery: setNoteSearchQuery,
    activeFolderId: activeNoteFolderId,
    setActiveFolderId: setActiveNoteFolderId,
    sortBy: noteSortBy,
    setSortBy: setNoteSortBy,
    showArchived: showArchivedNotes,
    setShowArchived: setShowArchivedNotes,
  } = useNoteStore();

  const [contentMode, setContentMode] = useState<'tasks' | 'notes'>('tasks');
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [noteFolderModalVisible, setNoteFolderModalVisible] = useState(false);
  const [folderInput, setFolderInput] = useState('');
  const [noteFolderInput, setNoteFolderInput] = useState('');
  const [isNoteEditorVisible, setIsNoteEditorVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    void loadTasks();
    void loadFolders();
    void loadNotes();
    void loadNoteFolders();
  }, [loadFolders, loadNoteFolders, loadNotes, loadTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.isArchived !== showArchived) return false;
      const matchesFilter = activeFilter === 'all' || task.category === activeFilter;
      const normalizedSearch = searchQuery.toLowerCase().trim();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description?.toLowerCase().includes(normalizedSearch);
      const matchesFolder = activeFolderId === 'all' || task.folderId === activeFolderId;
      return matchesFilter && matchesSearch && matchesFolder;
    });
  }, [tasks, showArchived, activeFilter, searchQuery, activeFolderId]);

  const completionRate = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.isArchived);
    if (activeTasks.length === 0) return 0;
    const completedTasks = activeTasks.filter((t) => t.isCompleted);
    return Math.round((completedTasks.length / activeTasks.length) * 100);
  }, [tasks]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = noteSearchQuery.toLowerCase().trim();
    const sorted = [...notes].sort((a, b) => {
      if (noteSortBy === 'subject') {
        return (a.subjectTag ?? '').localeCompare(b.subjectTag ?? '') || b.updatedAt.localeCompare(a.updatedAt);
      }
      if (noteSortBy === 'pinned') {
        return Number(b.isPinned) - Number(a.isPinned) || b.updatedAt.localeCompare(a.updatedAt);
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return sorted.filter((note) => {
      if (note.isArchived !== showArchivedNotes) return false;
      if (activeNoteTab === 'pinned' && !note.isPinned) return false;
      if (activeNoteTab === 'subjects' && !note.subjectTag) return false;
      if (activeNoteFolderId !== 'all' && note.folderId !== activeNoteFolderId) return false;
      if (!normalizedQuery) return true;
      return (
        note.title.toLowerCase().includes(normalizedQuery) ||
        note.body?.toLowerCase().includes(normalizedQuery) ||
        note.subjectTag?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeNoteFolderId, activeNoteTab, noteSearchQuery, noteSortBy, notes, showArchivedNotes]);

  const openFolderManager = () => setIsFolderModalVisible(true);

  const handleCreateFolder = async () => {
    const name = folderInput.trim();
    if (!name) return;
    await addFolder(name, 'folder');
    setFolderInput('');
  };

  const handleCreateNoteFolder = async () => {
    const name = noteFolderInput.trim();
    if (!name) return;
    await addNoteFolder(name, 'folder');
    setNoteFolderInput('');
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    if (!Alert.prompt) {
      Alert.alert(
        'Rename Folder',
        'Folder rename is currently available on iOS prompt APIs in this build.'
      );
      return;
    }

    Alert.prompt(
      'Rename Folder',
      'Enter a new name',
      async (value) => {
        const trimmed = value?.trim();
        if (!trimmed) return;
        await renameFolder(folderId, trimmed);
      },
      'plain-text',
      currentName
    );
  };

  const requestDeleteFolder = (folderId: string, folderName: string) => {
    Alert.alert(
      'Delete Folder',
      `Delete "${folderName}"? Tasks will be moved out of the folder.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteFolder(folderId);
          },
        },
      ]
    );
  };

  const handleRenameNoteFolder = (folderId: string, currentName: string) => {
    if (!Alert.prompt) {
      Alert.alert('Rename Folder', 'Folder rename is currently available on iOS prompt APIs in this build.');
      return;
    }
    Alert.prompt(
      'Rename Folder',
      'Enter a new name',
      async (value) => {
        const trimmed = value?.trim();
        if (!trimmed) return;
        await renameNoteFolder(folderId, trimmed);
      },
      'plain-text',
      currentName
    );
  };

  const requestDeleteNoteFolder = (folderId: string, folderName: string) => {
    Alert.alert('Delete Folder', `Delete "${folderName}"? Notes will be moved out of the folder.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteNoteFolder(folderId);
        },
      },
    ]);
  };

  const openNewNote = () => {
    setEditingNote(undefined);
    setIsNoteEditorVisible(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorVisible(true);
  };

  const saveNote = async (payload: {
    title: string;
    body?: string;
    subjectTag?: string;
    folderId?: string;
    isPinned?: boolean;
  }) => {
    if (editingNote) {
      await updateNote(editingNote.id, {
        title: payload.title,
        body: payload.body,
        subjectTag: payload.subjectTag,
        folderId: payload.folderId,
        isPinned: payload.isPinned,
      });
      return;
    }
    await addNote(payload);
  };

  return (
    <View style={styles.container}>
      <TopAppBar avatarUrl={user?.avatar_url} xp={user?.xp ?? 0} />
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{contentMode === 'tasks' ? 'MISSIONS' : 'MY NOTES'}</Text>
          <Text style={styles.headerSubtitle}>
            {contentMode === 'tasks'
              ? `${tasks.filter((t) => !t.isCompleted && !t.isArchived).length} items remaining`
              : `${filteredNotes.length} note${filteredNotes.length === 1 ? '' : 's'} shown`}
          </Text>
        </View>
        {contentMode === 'tasks' ? (
          <ComicProgressRing
            progress={completionRate / 100}
            label={`${completionRate}%`}
            size={56}
            strokeWidth={STROKE_WIDTH}
            accentColor={Colors.primaryContainer}
          />
        ) : null}
      </View>

      <View style={styles.tabRow}>
        <HardShadowBox shadowOffset={4} borderRadius={BorderRadius.full} style={{ flex: 1 }}>
          <TouchableOpacity
            style={[styles.tabButton, contentMode === 'tasks' && styles.tabButtonActive]}
            onPress={() => {
              LayoutAnimation.spring();
              setContentMode('tasks');
            }}
          >
            <Text style={[styles.tabButtonText, contentMode === 'tasks' && styles.tabButtonTextActive]}>Tasks</Text>
          </TouchableOpacity>
        </HardShadowBox>
        <HardShadowBox shadowOffset={4} borderRadius={BorderRadius.full} style={{ flex: 1 }}>
          <TouchableOpacity
            style={[styles.tabButton, contentMode === 'notes' && styles.tabButtonActive]}
            onPress={() => {
              LayoutAnimation.spring();
              setContentMode('notes');
            }}
          >
            <Text style={[styles.tabButtonText, contentMode === 'notes' && styles.tabButtonTextActive]}>Notes</Text>
          </TouchableOpacity>
        </HardShadowBox>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.outline} />
        <TextInput
          style={styles.searchInput}
          placeholder={contentMode === 'tasks' ? 'Search tasks...' : 'Search notes...'}
          placeholderTextColor={Colors.outline}
          value={contentMode === 'tasks' ? searchQuery : noteSearchQuery}
          onChangeText={contentMode === 'tasks' ? setSearchQuery : setNoteSearchQuery}
        />
        {(contentMode === 'tasks' ? searchQuery.length : noteSearchQuery.length) > 0 && (
          <TouchableOpacity onPress={() => (contentMode === 'tasks' ? setSearchQuery('') : setNoteSearchQuery(''))}>
            <MaterialIcons name="close" size={20} color={Colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, !(contentMode === 'tasks' ? showArchived : showArchivedNotes) && styles.tabButtonActive]}
          onPress={() => {
            LayoutAnimation.spring();
            contentMode === 'tasks' ? setShowArchived(false) : setShowArchivedNotes(false);
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              !(contentMode === 'tasks' ? showArchived : showArchivedNotes) && styles.tabButtonTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, (contentMode === 'tasks' ? showArchived : showArchivedNotes) && styles.tabButtonActive]}
          onPress={() => {
            LayoutAnimation.spring();
            contentMode === 'tasks' ? setShowArchived(true) : setShowArchivedNotes(true);
          }}
        >
          <Text
            style={[
              styles.tabButtonText,
              (contentMode === 'tasks' ? showArchived : showArchivedNotes) && styles.tabButtonTextActive,
            ]}
          >
            Archive
          </Text>
        </TouchableOpacity>
      </View>

      {contentMode === 'tasks' ? (
        <>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  category={cat}
                  active={activeFilter === cat}
                  onPress={() => setActiveFilter(cat)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.folderPill, activeFolderId === 'all' && styles.folderPillActive]}
                onPress={() => setActiveFolderId('all')}
              >
                <Text style={[styles.folderPillText, activeFolderId === 'all' && styles.folderPillTextActive]}>
                  All folders
                </Text>
              </TouchableOpacity>

              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[styles.folderPill, activeFolderId === folder.id && styles.folderPillActive]}
                  onPress={() => setActiveFolderId(folder.id)}
                >
                  <Text
                    style={[
                      styles.folderPillText,
                      activeFolderId === folder.id && styles.folderPillTextActive,
                    ]}
                  >
                    {folder.name}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.folderManageButton} onPress={openFolderManager}>
                <MaterialIcons name="create-new-folder" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          <FlashList
            data={filteredTasks}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggle={toggleComplete}
                onPin={togglePin}
                onArchive={archiveTask}
                onUnarchive={unarchiveTask}
                onMoveTask={moveTask}
                onDelete={(id) =>
                  Alert.alert('Delete task?', 'This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => void deleteTask(id) },
                  ])
                }
                folders={folders}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon={showArchived ? 'archive' : searchQuery.trim().length > 0 ? 'search-off' : 'assignment'}
                title={
                  showArchived
                    ? 'No archived tasks'
                    : searchQuery.trim().length > 0
                      ? 'No matching tasks'
                      : 'No tasks found'
                }
                description={
                  showArchived
                    ? 'Archived tasks appear here.'
                    : searchQuery.trim().length > 0
                      ? 'Try a different keyword or clear filters.'
                      : 'Add your first task to start tracking progress.'
                }
              />
            }
          />
        </>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {NOTE_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.pill, activeNoteTab === tab && styles.pillActive]}
                  onPress={() => setActiveNoteTab(tab)}
                >
                  <Text style={[styles.pillText, activeNoteTab === tab && styles.pillTextActive]}>
                    {tab === 'all' ? 'All' : tab === 'pinned' ? 'Pinned' : 'Subjects'}
                  </Text>
                </TouchableOpacity>
              ))}

              {NOTE_SORTS.map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[styles.folderPill, noteSortBy === sort && styles.folderPillActive]}
                  onPress={() => setNoteSortBy(sort)}
                >
                  <Text style={[styles.folderPillText, noteSortBy === sort && styles.folderPillTextActive]}>
                    Sort: {sort}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.folderPill, activeNoteFolderId === 'all' && styles.folderPillActive]}
                onPress={() => setActiveNoteFolderId('all')}
              >
                <Text style={[styles.folderPillText, activeNoteFolderId === 'all' && styles.folderPillTextActive]}>
                  All folders
                </Text>
              </TouchableOpacity>

              {noteFolders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[styles.folderPill, activeNoteFolderId === folder.id && styles.folderPillActive]}
                  onPress={() => setActiveNoteFolderId(folder.id)}
                >
                  <Text
                    style={[
                      styles.folderPillText,
                      activeNoteFolderId === folder.id && styles.folderPillTextActive,
                    ]}
                  >
                    {folder.name}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.folderManageButton}
                onPress={() => setNoteFolderModalVisible(true)}
              >
                <MaterialIcons name="create-new-folder" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          <FlashList
            data={filteredNotes}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openEditNote(item)} activeOpacity={0.9} style={styles.taskContainer}>
                <GlassCard style={styles.noteCard} intensity={20}>
                  <View style={styles.noteHeader}>
                    <View style={styles.noteTag}>
                      <Text style={styles.noteTagText}>{item.subjectTag || 'General'}</Text>
                    </View>
                    <View style={styles.folderListActions}>
                      <TouchableOpacity onPress={() => toggleNotePin(item.id)} style={styles.iconAction}>
                        <MaterialIcons
                          name="push-pin"
                          size={18}
                          color={item.isPinned ? Colors.primary : Colors.outline}
                          style={{ opacity: item.isPinned ? 1 : 0.5 }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          item.isArchived ? unarchiveNote(item.id) : archiveNote(item.id)
                        }
                        style={styles.iconAction}
                      >
                        <MaterialIcons
                          name={item.isArchived ? 'unarchive' : 'archive'}
                          size={18}
                          color={item.isArchived ? Colors.warning : Colors.onSurfaceVariant}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Delete note?', 'This cannot be undone.', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => void deleteNote(item.id) },
                          ])
                        }
                        style={styles.iconAction}
                      >
                        <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.body ? (
                    <Text style={styles.notePreview} numberOfLines={2}>
                      {item.body}
                    </Text>
                  ) : null}
                </GlassCard>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyState
                icon={showArchivedNotes ? 'archive' : noteSearchQuery.trim().length > 0 ? 'search-off' : 'note-alt'}
                title={
                  showArchivedNotes
                    ? 'No archived notes'
                    : noteSearchQuery.trim().length > 0
                      ? 'No matching notes'
                      : 'No notes found'
                }
                description={
                  showArchivedNotes
                    ? 'Archived notes appear here.'
                    : noteSearchQuery.trim().length > 0
                      ? 'Try a different search or adjust filters.'
                      : 'Create your first note to build your study vault.'
                }
              />
            }
          />
        </>
      )}

      <View style={[styles.fabWrap, { bottom: insets.bottom + 24 }]}>
        <HardShadowBox shadowOffset={6} borderRadius={32}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => (contentMode === 'tasks' ? setIsAddSheetVisible(true) : openNewNote())}
          >
            <MaterialIcons name="add" size={32} color="white" />
          </TouchableOpacity>
        </HardShadowBox>
      </View>

      <AddTaskSheet
        isVisible={isAddSheetVisible}
        onClose={() => setIsAddSheetVisible(false)}
      />

      <Modal
        visible={isFolderModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFolderModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Manage Folders</Text>
            <View style={styles.modalRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="New folder name"
                placeholderTextColor={Colors.outline}
                value={folderInput}
                onChangeText={setFolderInput}
              />
              <TouchableOpacity style={styles.addFolderBtn} onPress={() => void handleCreateFolder()}>
                <MaterialIcons name="add" size={20} color={Colors.background} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.folderListModal}>
              {folders.map((folder) => (
                <View key={folder.id} style={styles.folderListItem}>
                  <Text style={styles.folderListName}>{folder.name}</Text>
                  <View style={styles.folderListActions}>
                    <TouchableOpacity
                      onPress={() => handleRenameFolder(folder.id, folder.name)}
                      style={styles.iconAction}
                    >
                      <MaterialIcons name="edit" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => requestDeleteFolder(folder.id, folder.name)}
                      style={styles.iconAction}
                    >
                      <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <GradientButton title="Done" onPress={() => setIsFolderModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={noteFolderModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNoteFolderModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Manage Note Folders</Text>
            <View style={styles.modalRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="New folder name"
                placeholderTextColor={Colors.outline}
                value={noteFolderInput}
                onChangeText={setNoteFolderInput}
              />
              <TouchableOpacity style={styles.addFolderBtn} onPress={() => void handleCreateNoteFolder()}>
                <MaterialIcons name="add" size={20} color={Colors.background} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.folderListModal}>
              {noteFolders.map((folder) => (
                <View key={folder.id} style={styles.folderListItem}>
                  <Text style={styles.folderListName}>{folder.name}</Text>
                  <View style={styles.folderListActions}>
                    <TouchableOpacity
                      onPress={() => handleRenameNoteFolder(folder.id, folder.name)}
                      style={styles.iconAction}
                    >
                      <MaterialIcons name="edit" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => requestDeleteNoteFolder(folder.id, folder.name)}
                      style={styles.iconAction}
                    >
                      <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <GradientButton title="Done" onPress={() => setNoteFolderModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <NoteEditor
        isVisible={isNoteEditorVisible}
        initialNote={editingNote}
        folders={noteFolders}
        onClose={() => setIsNoteEditorVisible(false)}
        onSave={saveNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.headlineLg ?? 40,
    fontWeight: '700',
    color: Colors.primaryContainer,
    textTransform: 'uppercase',
    textShadowColor: '#111111',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  searchBar: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    height: 48,
    backgroundColor: Colors.surfaceLow,
    borderRadius: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 3,
    borderColor: '#111111',
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: '#111111',
  },
  tabButtonText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: Colors.background,
  },
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    marginRight: Spacing.sm,
    borderWidth: 3,
    borderColor: '#111111',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
    fontWeight: '700',
  },
  pillTextActive: {
    color: Colors.background,
  },
  folderPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 3,
    borderColor: '#111111',
    marginRight: Spacing.sm,
  },
  folderPillActive: {
    borderColor: '#111111',
    backgroundColor: Colors.primaryContainer,
  },
  folderPillText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
  },
  folderPillTextActive: {
    color: '#111111',
    fontWeight: '700',
  },
  folderManageButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  taskContainer: {
    marginBottom: Spacing.md,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 4,
    borderColor: '#111111',
  },
  noteCard: {
    padding: Spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  noteTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.secondary}22`,
    borderWidth: 1,
    borderColor: `${Colors.secondary}66`,
  },
  noteTagText: {
    color: Colors.secondary,
    fontFamily: Typography.fontFamily.body,
    fontWeight: '700',
    fontSize: Typography.size.xs,
  },
  noteTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  notePreview: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginTop: 6,
  },
  checkbox: {
    marginRight: Spacing.md,
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  taskTitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.onSurfaceVariant,
  },
  taskDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryBadge: {
    marginRight: Spacing.md,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    color: Colors.onSurfaceVariant,
    marginLeft: 4,
  },
  folderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  taskActions: {
    marginLeft: Spacing.sm,
    gap: 8,
  },
  iconAction: {
    padding: 2,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 4,
    borderColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabWrap: {
    position: 'absolute',
    right: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 4,
    borderColor: '#111111',
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    color: Colors.onSurface,
    marginBottom: Spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalInput: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceLow,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  addFolderBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 3,
    borderColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderListModal: {
    maxHeight: 220,
    marginBottom: Spacing.md,
  },
  folderListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outline}22`,
  },
  folderListName: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  folderListActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
