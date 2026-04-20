// app/(tabs)/vault/tasks.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { GradientButton } from '../../../src/components/shared/GradientButton';

const CATEGORIES: (TaskCategory | 'all')[] = ['all', 'study', 'personal', 'college'];
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RADIUS = 20;
const STROKE_WIDTH = 6;
const CIRCLE_LENGTH = 2 * Math.PI * RADIUS;

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
  folders,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onPin: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onMoveTask: (taskId: string, folderId?: string) => void;
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
      <GlassCard
        intensity={20}
        style={[
          styles.taskCard,
          { opacity: task.isCompleted ? 0.6 : 1 },
          { borderLeftWidth: 4, borderLeftColor: categoryColor },
        ]}
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
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {task.category}
              </Text>
            </View>

            {task.dueDate && (
              <View style={styles.dueContainer}>
                <MaterialIcons name="event" size={14} color={Colors.onSurfaceVariant} />
                <Text style={styles.dueText}>{task.dueDate}</Text>
              </View>
            )}

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
        </View>
      </GlassCard>
    </View>
  );
};

export default function TasksScreen() {
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
    isLoading,
  } = useTaskStore();

  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [folderInput, setFolderInput] = useState('');
  const progressOffset = useSharedValue(CIRCLE_LENGTH);

  useEffect(() => {
    void loadTasks();
    void loadFolders();
  }, [loadFolders, loadTasks]);

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

  useEffect(() => {
    const target = CIRCLE_LENGTH - (completionRate / 100) * CIRCLE_LENGTH;
    progressOffset.value = withTiming(target, { duration: 500 });
  }, [completionRate, progressOffset]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: progressOffset.value,
  }));

  const openFolderManager = () => setIsFolderModalVisible(true);

  const handleCreateFolder = async () => {
    const name = folderInput.trim();
    if (!name) return;
    await addFolder(name, 'folder');
    setFolderInput('');
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.filter((t) => !t.isCompleted && !t.isArchived).length} items remaining
          </Text>
        </View>
        <View style={styles.progressCircleWrap}>
          <Svg width={56} height={56}>
            <Circle
              cx={28}
              cy={28}
              r={RADIUS}
              stroke={`${Colors.outline}44`}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <AnimatedCircle
              animatedProps={animatedCircleProps}
              cx={28}
              cy={28}
              r={RADIUS}
              stroke={Colors.primary}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${CIRCLE_LENGTH}, ${CIRCLE_LENGTH}`}
              strokeLinecap="round"
              fill="none"
              rotation={-90}
              originX={28}
              originY={28}
            />
          </Svg>
          <Text style={styles.progressText}>{completionRate}%</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.outline} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={Colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={Colors.outline} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, !showArchived && styles.tabButtonActive]}
          onPress={() => setShowArchived(false)}
        >
          <Text style={[styles.tabButtonText, !showArchived && styles.tabButtonTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, showArchived && styles.tabButtonActive]}
          onPress={() => setShowArchived(true)}
        >
          <Text style={[styles.tabButtonText, showArchived && styles.tabButtonTextActive]}>
            Archive
          </Text>
        </TouchableOpacity>
      </View>

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
            folders={folders}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment" size={64} color={Colors.surfaceHigh} />
            <Text style={styles.emptyText}>
              {showArchived ? 'No archived tasks' : 'No tasks found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {showArchived
                ? 'Archived tasks appear here'
                : 'Try another filter or add your first task'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddSheetVisible(true)}
      >
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>

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
    fontSize: Typography.size.xl,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  progressCircleWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
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
    borderWidth: 1,
    borderColor: Colors.outline + '20',
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
    borderWidth: 1,
    borderColor: `${Colors.outline}33`,
    backgroundColor: Colors.surfaceLow,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
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
    borderWidth: 1,
    borderColor: Colors.outline + '20',
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
    borderWidth: 1,
    borderColor: `${Colors.outline}22`,
    marginRight: Spacing.sm,
  },
  folderPillActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  folderPillText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.onSurfaceVariant,
  },
  folderPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  folderManageButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: `${Colors.primary}88`,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  categoryText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
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
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    color: Colors.outline,
    marginTop: Spacing.sm,
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: `${Colors.outline}44`,
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
    backgroundColor: Colors.primary,
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
