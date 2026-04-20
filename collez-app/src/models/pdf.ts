export type PdfFolderType =
  | 'semester'
  | 'subject'
  | 'pyq'
  | 'books'
  | 'notes'
  | 'important'
  | 'custom';

export type PdfSortOption = 'date' | 'name' | 'size';

export interface PdfFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  folderType: PdfFolderType;
  createdAt: string;
  updatedAt: string;
}

export interface PdfFile {
  id: string;
  filename: string;
  localUri: string;
  folderId?: string;
  sizeBytes: number;
  lastAccessedAt?: string;
  createdAt: string;
}

export interface CreatePdfFolderInput {
  name: string;
  folderType?: PdfFolderType;
  parentFolderId?: string;
}
