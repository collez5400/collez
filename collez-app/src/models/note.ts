export interface NoteFolder {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  body?: string;
  subjectTag?: string;
  folderId?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NoteTab = 'all' | 'pinned' | 'subjects';
export type NoteSortOption = 'date' | 'subject' | 'pinned';

export interface CreateNoteInput {
  title: string;
  body?: string;
  subjectTag?: string;
  folderId?: string;
  isPinned?: boolean;
}
