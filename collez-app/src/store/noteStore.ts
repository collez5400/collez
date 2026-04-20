import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { CreateNoteInput, Note, NoteFolder, NoteSortOption, NoteTab } from '../models/note';
import { getDb } from '../services/sqliteService';

interface NoteState {
  notes: Note[];
  folders: NoteFolder[];
  activeTab: NoteTab;
  searchQuery: string;
  activeFolderId: string | 'all';
  sortBy: NoteSortOption;
  showArchived: boolean;
  isLoading: boolean;

  loadNotes: () => Promise<void>;
  loadFolders: () => Promise<void>;
  addNote: (note: CreateNoteInput) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  addFolder: (name: string, icon: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setActiveTab: (tab: NoteTab) => void;
  setSearchQuery: (query: string) => void;
  setActiveFolderId: (folderId: string | 'all') => void;
  setSortBy: (sortBy: NoteSortOption) => void;
  setShowArchived: (showArchived: boolean) => void;
}

type NoteRow = {
  id: string;
  title: string;
  body: string | null;
  subject_tag: string | null;
  folder_id: string | null;
  is_pinned: number;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

type NoteFolderRow = {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  folders: [],
  activeTab: 'all',
  searchQuery: '',
  activeFolderId: 'all',
  sortBy: 'date',
  showArchived: false,
  isLoading: false,

  loadNotes: async () => {
    set({ isLoading: true });
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<NoteRow>(
        'SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC'
      );

      const notes: Note[] = rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body ?? undefined,
        subjectTag: row.subject_tag ?? undefined,
        folderId: row.folder_id ?? undefined,
        isPinned: row.is_pinned === 1,
        isArchived: row.is_archived === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      set({ notes, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },

  loadFolders: async () => {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<NoteFolderRow>('SELECT * FROM note_folders ORDER BY name ASC');
      const folders: NoteFolder[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      set({ folders });
    } catch (error) {
      console.error('Failed to load note folders:', error);
    }
  },

  addNote: async (noteData) => {
    try {
      const db = await getDb();
      const id = uuidv4();
      const now = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO notes (
          id, title, body, subject_tag, folder_id, is_pinned, is_archived, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          id,
          noteData.title.trim(),
          noteData.body?.trim() || null,
          noteData.subjectTag?.trim() || null,
          noteData.folderId || null,
          noteData.isPinned ? 1 : 0,
          now,
          now,
        ]
      );

      await get().loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  },

  updateNote: async (id, updates) => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      const currentNote = get().notes.find((note) => note.id === id);
      if (!currentNote) return;

      const title = updates.title ?? currentNote.title;
      const body = updates.body ?? currentNote.body;
      const subjectTag = updates.subjectTag ?? currentNote.subjectTag;
      const folderId = updates.folderId ?? currentNote.folderId;
      const isPinned =
        updates.isPinned !== undefined ? (updates.isPinned ? 1 : 0) : currentNote.isPinned ? 1 : 0;
      const isArchived =
        updates.isArchived !== undefined ? (updates.isArchived ? 1 : 0) : currentNote.isArchived ? 1 : 0;

      await db.runAsync(
        `UPDATE notes
         SET title = ?, body = ?, subject_tag = ?, folder_id = ?, is_pinned = ?, is_archived = ?, updated_at = ?
         WHERE id = ?`,
        [title, body || null, subjectTag || null, folderId || null, isPinned, isArchived, now, id]
      );

      await get().loadNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  },

  deleteNote: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
      await get().loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((item) => item.id === id);
    if (note) {
      await get().updateNote(id, { isPinned: !note.isPinned });
    }
  },

  archiveNote: async (id) => {
    await get().updateNote(id, { isArchived: true });
  },

  unarchiveNote: async (id) => {
    await get().updateNote(id, { isArchived: false });
  },

  addFolder: async (name, icon) => {
    try {
      const db = await getDb();
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.runAsync(
        'INSERT INTO note_folders (id, name, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [id, name.trim(), icon, now, now]
      );
      await get().loadFolders();
    } catch (error) {
      console.error('Failed to add note folder:', error);
    }
  },

  renameFolder: async (id, name) => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      await db.runAsync('UPDATE note_folders SET name = ?, updated_at = ? WHERE id = ?', [
        name.trim(),
        now,
        id,
      ]);
      await get().loadFolders();
    } catch (error) {
      console.error('Failed to rename note folder:', error);
    }
  },

  deleteFolder: async (id) => {
    try {
      const db = await getDb();
      await db.runAsync('DELETE FROM note_folders WHERE id = ?', [id]);
      await db.runAsync('UPDATE notes SET folder_id = NULL WHERE folder_id = ?', [id]);
      await get().loadFolders();
      await get().loadNotes();
    } catch (error) {
      console.error('Failed to delete note folder:', error);
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFolderId: (folderId) => set({ activeFolderId: folderId }),
  setSortBy: (sortBy) => set({ sortBy }),
  setShowArchived: (showArchived) => set({ showArchived }),
}));
