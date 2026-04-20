import { create } from 'zustand';
import { CreateTaskInput, Task, TaskCategory, TaskFolder } from '../models/task';
import { getDb } from '../services/sqliteService';
import { v4 as uuidv4 } from 'uuid';
import { useStreakStore } from './streakStore';

interface TaskState {
  tasks: Task[];
  folders: TaskFolder[];
  activeFilter: TaskCategory | 'all';
  searchQuery: string;
  activeFolderId: string | 'all';
  showArchived: boolean;
  isLoading: boolean;

  loadTasks: () => Promise<void>;
  loadFolders: () => Promise<void>;
  addTask: (task: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  archiveTask: (id: string) => Promise<void>;
  unarchiveTask: (id: string) => Promise<void>;
  addFolder: (name: string, icon: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveTask: (taskId: string, folderId?: string) => Promise<void>;
  setActiveFilter: (filter: TaskCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setActiveFolderId: (folderId: string | 'all') => void;
  setShowArchived: (showArchived: boolean) => void;
}

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  folder_id: string | null;
  is_completed: number;
  is_pinned: number;
  is_archived: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type TaskFolderRow = {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  folders: [],
  activeFilter: 'all',
  searchQuery: '',
  activeFolderId: 'all',
  showArchived: false,
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<TaskRow>(
        'SELECT * FROM tasks ORDER BY is_pinned DESC, created_at DESC'
      );
      
      const tasks: Task[] = rows.map((row: TaskRow) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        category: row.category as TaskCategory,
        folderId: row.folder_id ?? undefined,
        isCompleted: row.is_completed === 1,
        isPinned: row.is_pinned === 1,
        isArchived: row.is_archived === 1,
        dueDate: row.due_date ?? undefined,
        completedAt: row.completed_at ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },

  loadFolders: async () => {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<TaskFolderRow>('SELECT * FROM task_folders ORDER BY name ASC');
      
      const folders: TaskFolder[] = rows.map((row: TaskFolderRow) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      
      set({ folders });
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  },

  addTask: async (taskData) => {
    try {
      const db = await getDb();
      const id = uuidv4();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO tasks (
          id, title, description, category, folder_id, due_date, completed_at,
          is_completed, is_pinned, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`,
        [
          id,
          taskData.title,
          taskData.description || null,
          taskData.category,
          taskData.folderId || null,
          taskData.dueDate || null,
          null,
          now,
          now,
        ]
      );

      await get().loadTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },

  updateTask: async (id, updates) => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      
      // Get current task
      const currentTask = get().tasks.find(t => t.id === id);
      if (!currentTask) return;

      const title = updates.title ?? currentTask.title;
      const description = updates.description ?? currentTask.description;
      const category = updates.category ?? currentTask.category;
      const folderId = updates.folderId ?? currentTask.folderId;
      const dueDate = updates.dueDate ?? currentTask.dueDate;
      const isCompleted = updates.isCompleted !== undefined ? (updates.isCompleted ? 1 : 0) : (currentTask.isCompleted ? 1 : 0);
      const isPinned = updates.isPinned !== undefined ? (updates.isPinned ? 1 : 0) : (currentTask.isPinned ? 1 : 0);
      const isArchived = updates.isArchived !== undefined ? (updates.isArchived ? 1 : 0) : (currentTask.isArchived ? 1 : 0);
      const completedAt = updates.completedAt ?? currentTask.completedAt;

      await db.runAsync(
        `UPDATE tasks SET title = ?, description = ?, category = ?, folder_id = ?, due_date = ?, completed_at = ?, is_completed = ?, is_pinned = ?, is_archived = ?, updated_at = ?
         WHERE id = ?`,
        [title, description || null, category, folderId || null, dueDate || null, completedAt || null, isCompleted, isPinned, isArchived, now, id]
      );

      await get().loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  deleteTask: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
      await get().loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },

  toggleComplete: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (task) {
      const nextCompleted = !task.isCompleted;
      await get().updateTask(id, {
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined,
      });
      if (nextCompleted) {
        void useStreakStore.getState().logStreakAction('task_complete');
      }
    }
  },

  togglePin: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (task) {
      await get().updateTask(id, { isPinned: !task.isPinned });
    }
  },

  archiveTask: async (id) => {
    await get().updateTask(id, { isArchived: true });
  },

  unarchiveTask: async (id) => {
    await get().updateTask(id, { isArchived: false });
  },

  addFolder: async (name, icon) => {
    try {
      const db = await getDb();
      const id = uuidv4();
      const now = new Date().toISOString();
      
      await db.runAsync(
        'INSERT INTO task_folders (id, name, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, name, icon, now, now]
      );
      
      await get().loadFolders();
    } catch (error) {
      console.error('Failed to add folder:', error);
    }
  },

  renameFolder: async (id, name) => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      await db.runAsync(
        'UPDATE task_folders SET name = ?, updated_at = ? WHERE id = ?',
        [name.trim(), now, id]
      );
      await get().loadFolders();
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  },

  deleteFolder: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM task_folders WHERE id = ?', [id]);
      // Also clear folder_id for tasks in this folder
      await db.runAsync('UPDATE tasks SET folder_id = NULL WHERE folder_id = ?', [id]);
      
      await get().loadFolders();
      await get().loadTasks();
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  },

  moveTask: async (taskId, folderId) => {
    await get().updateTask(taskId, { folderId });
  },

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFolderId: (folderId) => set({ activeFolderId: folderId }),
  setShowArchived: (showArchived) => set({ showArchived }),
}));
