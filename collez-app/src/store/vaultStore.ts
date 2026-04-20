import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import * as DocumentPicker from 'expo-document-picker';
import { Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as LegacyFileSystem from 'expo-file-system/legacy';

import { getDb } from '../services/sqliteService';
import { CreatePdfFolderInput, PdfFile, PdfFolder, PdfFolderType } from '../models/pdf';

type PdfFileRow = {
  id: string;
  filename: string;
  local_uri: string;
  folder_id: string | null;
  size_bytes: number;
  last_accessed_at: string | null;
  created_at: string;
};

type PdfFolderRow = {
  id: string;
  name: string;
  parent_id: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
};

const VAULT_DIR = `${LegacyFileSystem.documentDirectory ?? ''}vault`;

const isValidFolderType = (value: string): value is PdfFolderType => {
  return ['semester', 'subject', 'pyq', 'books', 'notes', 'important', 'custom'].includes(value);
};

const getFolderType = (storedValue: string | null): PdfFolderType => {
  if (storedValue && isValidFolderType(storedValue)) {
    return storedValue;
  }
  return 'custom';
};

interface VaultState {
  files: PdfFile[];
  folders: PdfFolder[];
  recentFiles: PdfFile[];
  currentFolderId?: string;
  searchQuery: string;
  totalStorageUsedBytes: number;
  freeDiskStorageBytes: number;
  isLoading: boolean;

  loadVaultData: () => Promise<void>;
  loadFiles: () => Promise<void>;
  loadFolders: () => Promise<void>;
  refreshStorageStats: () => Promise<void>;
  uploadPdf: (folderId?: string) => Promise<boolean>;
  openFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, nextName: string) => Promise<void>;
  moveFile: (fileId: string, folderId?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  trackAccess: (fileId: string) => Promise<void>;
  addFolder: (input: CreatePdfFolderInput) => Promise<void>;
  renameFolder: (folderId: string, nextName: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  setCurrentFolderId: (folderId?: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  files: [],
  folders: [],
  recentFiles: [],
  currentFolderId: undefined,
  searchQuery: '',
  totalStorageUsedBytes: 0,
  freeDiskStorageBytes: 0,
  isLoading: false,

  loadVaultData: async () => {
    set({ isLoading: true });
    await Promise.all([get().loadFolders(), get().loadFiles(), get().refreshStorageStats()]);
    set({ isLoading: false });
  },

  loadFiles: async () => {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<PdfFileRow>(
        'SELECT * FROM pdf_files ORDER BY created_at DESC'
      );

      const files = rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        localUri: row.local_uri,
        folderId: row.folder_id ?? undefined,
        sizeBytes: row.size_bytes,
        lastAccessedAt: row.last_accessed_at ?? undefined,
        createdAt: row.created_at,
      }));

      const recentFiles = [...files]
        .sort((a, b) => {
          const aDate = a.lastAccessedAt ?? a.createdAt;
          const bDate = b.lastAccessedAt ?? b.createdAt;
          return bDate.localeCompare(aDate);
        })
        .slice(0, 10);

      set({ files, recentFiles });
    } catch (error) {
      console.error('Failed to load PDF files:', error);
    }
  },

  loadFolders: async () => {
    try {
      const db = await getDb();
      const rows = await db.getAllAsync<PdfFolderRow>('SELECT * FROM pdf_folders ORDER BY name ASC');

      const folders = rows.map((row) => ({
        id: row.id,
        name: row.name,
        parentFolderId: row.parent_id ?? undefined,
        folderType: getFolderType(row.icon),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      set({ folders });
    } catch (error) {
      console.error('Failed to load PDF folders:', error);
    }
  },

  refreshStorageStats: async () => {
    try {
      const files = get().files;
      const stats = await Promise.all(
        files.map((file) => LegacyFileSystem.getInfoAsync(file.localUri))
      );

      const totalStorageUsedBytes = stats.reduce((total, stat) => {
        if (stat.exists && typeof stat.size === 'number') {
          return total + stat.size;
        }
        return total;
      }, 0);

      const freeDiskStorageBytes = await LegacyFileSystem.getFreeDiskStorageAsync();
      set({ totalStorageUsedBytes, freeDiskStorageBytes });
    } catch (error) {
      console.error('Failed to refresh vault storage stats:', error);
    }
  },

  uploadPdf: async (folderId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || result.assets.length === 0) {
        return false;
      }

      const asset = result.assets[0];
      const db = await getDb();

      await LegacyFileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true });

      const extension = asset.name.toLowerCase().endsWith('.pdf') ? '' : '.pdf';
      const targetName = `${uuidv4()}${extension}`;
      const targetUri = `${VAULT_DIR}/${targetName}`;
      const now = new Date().toISOString();
      const fileId = uuidv4();

      await LegacyFileSystem.copyAsync({
        from: asset.uri,
        to: targetUri,
      });

      await db.runAsync(
        `INSERT INTO pdf_files (
          id, filename, local_uri, folder_id, size_bytes, last_accessed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fileId, asset.name, targetUri, folderId ?? null, asset.size ?? 0, now, now]
      );

      await get().loadFiles();
      await get().refreshStorageStats();
      return true;
    } catch (error) {
      console.error('Failed to upload PDF:', error);
      return false;
    }
  },

  openFile: async (fileId) => {
    try {
      const file = get().files.find((entry) => entry.id === fileId);
      if (!file) return;

      const info = await LegacyFileSystem.getInfoAsync(file.localUri);
      if (!info.exists) {
        console.warn('PDF no longer exists on disk');
        return;
      }

      const canOpenDirectly = await Linking.canOpenURL(file.localUri);
      if (canOpenDirectly) {
        await Linking.openURL(file.localUri);
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.localUri);
      }

      await get().trackAccess(fileId);
    } catch (error) {
      console.error('Failed to open PDF file:', error);
    }
  },

  renameFile: async (fileId, nextName) => {
    try {
      const trimmedName = nextName.trim();
      if (!trimmedName) return;

      const file = get().files.find((entry) => entry.id === fileId);
      if (!file) return;

      const safeName = trimmedName.toLowerCase().endsWith('.pdf')
        ? trimmedName
        : `${trimmedName}.pdf`;

      const now = new Date().toISOString();
      const db = await getDb();
      await db.runAsync('UPDATE pdf_files SET filename = ?, last_accessed_at = ? WHERE id = ?', [
        safeName,
        now,
        fileId,
      ]);

      await get().loadFiles();
    } catch (error) {
      console.error('Failed to rename PDF file:', error);
    }
  },

  moveFile: async (fileId, folderId) => {
    try {
      const db = await getDb();
      await db.runAsync('UPDATE pdf_files SET folder_id = ? WHERE id = ?', [folderId ?? null, fileId]);
      await get().loadFiles();
    } catch (error) {
      console.error('Failed to move PDF file:', error);
    }
  },

  deleteFile: async (fileId) => {
    try {
      const file = get().files.find((entry) => entry.id === fileId);
      if (!file) return;

      const db = await getDb();
      await db.runAsync('DELETE FROM pdf_files WHERE id = ?', [fileId]);
      await LegacyFileSystem.deleteAsync(file.localUri, { idempotent: true });

      await get().loadFiles();
      await get().refreshStorageStats();
    } catch (error) {
      console.error('Failed to delete PDF file:', error);
    }
  },

  trackAccess: async (fileId) => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      await db.runAsync('UPDATE pdf_files SET last_accessed_at = ? WHERE id = ?', [now, fileId]);
      await get().loadFiles();
    } catch (error) {
      console.error('Failed to track PDF access:', error);
    }
  },

  addFolder: async (input) => {
    try {
      const now = new Date().toISOString();
      const id = uuidv4();
      const db = await getDb();
      const folderType = input.folderType ?? 'custom';

      await db.runAsync(
        `INSERT INTO pdf_folders (
          id, name, parent_id, icon, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, input.name.trim(), input.parentFolderId ?? null, folderType, now, now]
      );

      await get().loadFolders();
    } catch (error) {
      console.error('Failed to create PDF folder:', error);
    }
  },

  renameFolder: async (folderId, nextName) => {
    try {
      const trimmedName = nextName.trim();
      if (!trimmedName) return;

      const db = await getDb();
      const now = new Date().toISOString();
      await db.runAsync('UPDATE pdf_folders SET name = ?, updated_at = ? WHERE id = ?', [
        trimmedName,
        now,
        folderId,
      ]);

      await get().loadFolders();
    } catch (error) {
      console.error('Failed to rename PDF folder:', error);
    }
  },

  deleteFolder: async (folderId) => {
    try {
      const db = await getDb();
      // Move nested folders and files to root before deletion.
      await db.runAsync('UPDATE pdf_folders SET parent_id = NULL WHERE parent_id = ?', [folderId]);
      await db.runAsync('UPDATE pdf_files SET folder_id = NULL WHERE folder_id = ?', [folderId]);
      await db.runAsync('DELETE FROM pdf_folders WHERE id = ?', [folderId]);

      if (get().currentFolderId === folderId) {
        set({ currentFolderId: undefined });
      }

      await get().loadFolders();
      await get().loadFiles();
    } catch (error) {
      console.error('Failed to delete PDF folder:', error);
    }
  },

  setCurrentFolderId: (folderId) => set({ currentFolderId: folderId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
