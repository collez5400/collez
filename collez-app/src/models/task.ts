export type TaskCategory = 'study' | 'personal' | 'college';

export interface TaskFolder {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  folderId?: string;
  isCompleted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: TaskCategory;
  folderId?: string;
  dueDate?: string;
}
