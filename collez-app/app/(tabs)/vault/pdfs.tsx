import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { BorderRadius, Colors, Spacing, Typography } from '../../../src/config/theme';
import { GlassCard } from '../../../src/components/shared/GlassCard';
import { GradientButton } from '../../../src/components/shared/GradientButton';
import { PdfFile, PdfFolderType, PdfSortOption } from '../../../src/models/pdf';
import { useVaultStore } from '../../../src/store/vaultStore';
import { ErrorState } from '../../../src/components/shared/ErrorState';
import { TopAppBar } from '../../../src/components/shared/TopAppBar';
import { ComicProgressBar } from '../../../src/components/shared/ComicProgressBar';
import { StickerChip } from '../../../src/components/shared/StickerChip';
import { useAuthStore } from '../../../src/store/authStore';
import { HardShadowBox } from '../../../src/components/shared/HardShadowBox';

const SORT_OPTIONS: PdfSortOption[] = ['date', 'name', 'size'];
const FOLDER_TYPES: PdfFolderType[] = ['semester', 'subject', 'pyq', 'books', 'notes', 'important', 'custom'];

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFolderIcon = (type: PdfFolderType) => {
  switch (type) {
    case 'semester':
      return 'school';
    case 'subject':
      return 'menu-book';
    case 'pyq':
      return 'quiz';
    case 'books':
      return 'library-books';
    case 'notes':
      return 'note-alt';
    case 'important':
      return 'priority-high';
    default:
      return 'folder';
  }
};

export default function PDFsScreen() {
  const {
    files,
    folders,
    recentFiles,
    currentFolderId,
    searchQuery,
    totalStorageUsedBytes,
    freeDiskStorageBytes,
    isLoading,
    error,
    loadVaultData,
    uploadPdf,
    openFile,
    renameFile,
    moveFile,
    deleteFile,
    addFolder,
    renameFolder,
    deleteFolder,
    setCurrentFolderId,
    setSearchQuery,
    syncFromCloud,
    syncToCloud,
  } = useVaultStore();
  const premiumConfig = useAuthStore((s) => s.user?.premium_config);
  const user = useAuthStore((s) => s.user);
  const isPremiumUser = (premiumConfig?.unlocked_themes?.length ?? 0) > 1;

  const [sortBy, setSortBy] = useState<PdfSortOption>('date');
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderType, setFolderType] = useState<PdfFolderType>('custom');
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ type: 'file' | 'folder'; id: string } | null>(null);

  useEffect(() => {
    void loadVaultData();
  }, [loadVaultData]);

  const currentFolders = useMemo(
    () => folders.filter((folder) => folder.parentFolderId === currentFolderId),
    [folders, currentFolderId]
  );
  const folderItems = useMemo(
    () => [{ kind: 'new' as const }, ...currentFolders.map((folder) => ({ kind: 'folder' as const, folder }))],
    [currentFolders]
  );

  const currentFiles = useMemo(() => {
    const normalized = searchQuery.toLowerCase().trim();
    const filtered = files.filter((file) => {
      const inFolder = file.folderId === currentFolderId;
      const matchesSearch = !normalized || file.filename.toLowerCase().includes(normalized);
      return inFolder && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.filename.localeCompare(b.filename);
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
      const aDate = a.lastAccessedAt ?? a.createdAt;
      const bDate = b.lastAccessedAt ?? b.createdAt;
      return bDate.localeCompare(aDate);
    });
  }, [currentFolderId, files, searchQuery, sortBy]);

  const filteredRecentFiles = useMemo(() => {
    const normalized = searchQuery.toLowerCase().trim();
    if (!normalized) return recentFiles;
    return recentFiles.filter((file) => file.filename.toLowerCase().includes(normalized));
  }, [recentFiles, searchQuery]);

  const breadcrumb = useMemo(() => {
    const chain: { id?: string; name: string }[] = [{ id: undefined, name: 'Root' }];
    if (!currentFolderId) return chain;

    const map = new Map(folders.map((folder) => [folder.id, folder]));
    let pointer = map.get(currentFolderId);
    const stack: { id: string; name: string }[] = [];
    while (pointer) {
      stack.push({ id: pointer.id, name: pointer.name });
      pointer = pointer.parentFolderId ? map.get(pointer.parentFolderId) : undefined;
    }
    return [...chain, ...stack.reverse()];
  }, [currentFolderId, folders]);

  const totalDisk = totalStorageUsedBytes + freeDiskStorageBytes;
  const usagePercent = totalDisk > 0 ? (totalStorageUsedBytes / totalDisk) * 100 : 0;

  const onUpload = async () => {
    const success = await uploadPdf(currentFolderId);
    if (!success) return;
    Alert.alert('Uploaded', 'PDF added to vault.');
  };

  const openRenameDialog = (target: { type: 'file' | 'folder'; id: string }, initialName: string) => {
    setRenameTarget(target);
    setRenameValue(initialName);
    setRenameModalVisible(true);
  };

  const submitRename = async () => {
    if (!renameTarget) return;
    if (renameTarget.type === 'file') {
      await renameFile(renameTarget.id, renameValue);
    } else {
      await renameFolder(renameTarget.id, renameValue);
    }
    setRenameModalVisible(false);
    setRenameTarget(null);
    setRenameValue('');
  };

  const requestDeleteFile = (file: PdfFile) => {
    Alert.alert('Delete PDF', `Delete "${file.filename}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteFile(file.id);
        },
      },
    ]);
  };

  const requestDeleteFolder = (folderId: string, name: string) => {
    Alert.alert('Delete Folder', `Delete "${name}"? Nested folders and files move to root.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteFolder(folderId);
        },
      },
    ]);
  };

  const requestMoveFile = (fileId: string) => {
    Alert.alert(
      'Move PDF',
      'Choose destination',
      [
        { text: 'Root', onPress: () => void moveFile(fileId, undefined) },
        ...folders.map((folder) => ({
          text: folder.name,
          onPress: () => void moveFile(fileId, folder.id),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  };

  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    await addFolder({
      name,
      folderType,
      parentFolderId: currentFolderId,
    });
    setFolderName('');
    setFolderType('custom');
    setFolderModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TopAppBar avatarUrl={user?.avatar_url} xp={user?.xp ?? 0} onAvatarPress={() => {}} />
      <StatusBar barStyle="light-content" />

      {error ? <ErrorState message={error} onRetry={loadVaultData} compact /> : null}

      <Animated.View entering={FadeInUp.duration(260)} style={styles.header}>
        <HardShadowBox shadowOffset={4} borderRadius={12} style={styles.titleWrap}>
          <View style={styles.titleGradient}>
            <Text style={styles.title}>VAULT</Text>
          </View>
        </HardShadowBox>
        <View style={styles.storageWrap}>
          <ComicProgressBar
            progress={Math.max(0, Math.min(1, usagePercent / 100))}
            label={`${formatBytes(totalStorageUsedBytes)} used`}
            valueLabel={`${Math.round(usagePercent)}%`}
            compact
          />
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageContent}>
      <Animated.View entering={FadeInUp.delay(50).duration(260)} style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.outline} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search PDFs..."
          placeholderTextColor={Colors.outline}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={Colors.outline} />
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breadcrumbRow}>
        {breadcrumb.map((segment, index) => (
          <React.Fragment key={segment.id ?? 'root'}>
            <TouchableOpacity onPress={() => setCurrentFolderId(segment.id)}>
              <Text style={[styles.breadcrumbText, index === breadcrumb.length - 1 && styles.breadcrumbTextActive]}>
                {segment.name}
              </Text>
            </TouchableOpacity>
            {index < breadcrumb.length - 1 ? <Text style={styles.breadcrumbDivider}>/</Text> : null}
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.sortChip, sortBy === option && styles.sortChipActive]}
            onPress={() => setSortBy(option)}
          >
            <StickerChip label={`Sort: ${option}`} tone={sortBy === option ? 'yellow' : 'dark'} />
          </TouchableOpacity>
        ))}
      </View>

      <HardShadowBox shadowOffset={6} borderRadius={12} style={styles.uploadWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => void onUpload()} style={styles.uploadCard}>
          <MaterialIcons name="upload-file" size={22} color={Colors.background} />
          <Text style={styles.uploadText}>Upload PDF</Text>
          <MaterialIcons name="arrow-forward" size={18} color={Colors.background} />
        </TouchableOpacity>
      </HardShadowBox>

      {isPremiumUser ? (
        <View style={styles.syncRow}>
          <TouchableOpacity style={styles.syncBtn} onPress={() => void syncToCloud()}>
            <MaterialIcons name="cloud-upload" size={16} color={Colors.primary} />
            <Text style={styles.syncBtnText}>Sync to Cloud</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncBtn} onPress={() => void syncFromCloud()}>
            <MaterialIcons name="cloud-download" size={16} color={Colors.primary} />
            <Text style={styles.syncBtnText}>Restore from Cloud</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Folders</Text>
        <TouchableOpacity onPress={() => setFolderModalVisible(true)}>
          <MaterialIcons name="create-new-folder" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        scrollEnabled={false}
        data={folderItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.folderList}
        keyExtractor={(item) => (item.kind === 'new' ? 'new-folder-card' : item.folder.id)}
        renderItem={({ item }) => {
          if (item.kind === 'new') {
            return (
              <TouchableOpacity style={styles.newFolderCard} onPress={() => setFolderModalVisible(true)}>
                <MaterialIcons name="add" size={24} color={Colors.primary} />
                <Text style={styles.newFolderText}>New Folder</Text>
              </TouchableOpacity>
            );
          }

          const folder = item.folder;
          const iconName = getFolderIcon(folder.folderType);
          return (
            <HardShadowBox shadowOffset={6} borderRadius={12}>
              <TouchableOpacity
                style={styles.folderCard}
                onPress={() => setCurrentFolderId(folder.id)}
                onLongPress={() =>
                  Alert.alert(folder.name, 'Choose action', [
                    { text: 'Rename', onPress: () => openRenameDialog({ type: 'folder', id: folder.id }, folder.name) },
                    { text: 'Delete', style: 'destructive', onPress: () => requestDeleteFolder(folder.id, folder.name) },
                    { text: 'Cancel', style: 'cancel' },
                  ])
                }
              >
                <MaterialIcons name={iconName} size={24} color={Colors.primary} />
                <Text numberOfLines={1} style={styles.folderName}>
                  {folder.name}
                </Text>
                <Text style={styles.folderMeta}>{folder.folderType.toUpperCase()}</Text>
              </TouchableOpacity>
            </HardShadowBox>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyInline}>
            <Text style={styles.emptyInlineText}>No folders yet.</Text>
          </View>
        }
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Documents</Text>
      </View>

      <FlashList
        scrollEnabled={false}
        data={currentFiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.fileList}
        renderItem={({ item }) => (
          <GlassCard intensity={20} style={styles.fileCard}>
            <TouchableOpacity style={styles.fileMain} onPress={() => void openFile(item.id)}>
              <MaterialIcons name="picture-as-pdf" size={24} color={Colors.error} />
              <View style={styles.fileTextWrap}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {item.filename}
                </Text>
                <Text style={styles.fileMeta}>
                  {formatBytes(item.sizeBytes)} • {item.lastAccessedAt ? 'recently opened' : 'new'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.fileActions}>
              <TouchableOpacity onPress={() => requestMoveFile(item.id)} style={styles.iconBtn}>
                <MaterialIcons name="drive-file-move" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openRenameDialog({ type: 'file', id: item.id }, item.filename)}
                style={styles.iconBtn}
              >
                <MaterialIcons name="edit" size={18} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => requestDeleteFile(item)} style={styles.iconBtn}>
                <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="picture-as-pdf" size={56} color={Colors.surfaceHigh} />
            <Text style={styles.emptyTitle}>No PDFs in this folder</Text>
            <Text style={styles.emptySubtitle}>Upload your first document to get started.</Text>
          </View>
        }
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent</Text>
      </View>

      <FlashList
        scrollEnabled={false}
        data={filteredRecentFiles}
        horizontal
        keyExtractor={(item) => `recent-${item.id}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recentCard} onPress={() => void openFile(item.id)}>
            <MaterialIcons name="description" size={20} color={Colors.primary} />
            <Text numberOfLines={1} style={styles.recentName}>
              {item.filename}
            </Text>
            <Text style={styles.recentMeta}>{formatBytes(item.sizeBytes)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyInline}>
            <Text style={styles.emptyInlineText}>No recent documents yet.</Text>
          </View>
        }
      />
      </ScrollView>

      <View style={styles.fabWrap}>
        <HardShadowBox shadowOffset={6} borderRadius={29}>
          <TouchableOpacity style={styles.fab} onPress={() => void onUpload()}>
            <MaterialIcons name="upload" size={28} color="#fff" />
          </TouchableOpacity>
        </HardShadowBox>
      </View>

      <Modal visible={folderModalVisible} transparent animationType="fade" onRequestClose={() => setFolderModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Folder</Text>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Folder name"
              placeholderTextColor={Colors.outline}
              style={styles.modalInput}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalTypeList}>
              {FOLDER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, folderType === type && styles.typeChipActive]}
                  onPress={() => setFolderType(type)}
                >
                  <Text style={[styles.typeChipText, folderType === type && styles.typeChipTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <GradientButton title="Create" onPress={() => void createFolder()} />
            <TouchableOpacity onPress={() => setFolderModalVisible(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={renameModalVisible} transparent animationType="fade" onRequestClose={() => setRenameModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rename</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Enter new name"
              placeholderTextColor={Colors.outline}
              style={styles.modalInput}
            />
            <GradientButton title="Save" onPress={() => void submitRename()} />
            <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!isLoading ? null : (
        <View style={styles.loadingBadge}>
          <Text style={styles.loadingText}>Refreshing vault...</Text>
        </View>
      )}
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
    paddingTop: Spacing.md,
  },
  titleWrap: {
    alignSelf: 'flex-start',
  },
  titleGradient: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 3,
    borderColor: '#111111',
  },
  title: {
    color: '#000000',
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.headlineMd ?? 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  storageWrap: {
    marginBottom: Spacing.sm,
  },
  storageLabel: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    marginBottom: 6,
  },
  searchBar: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceLow,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  pageContent: {
    paddingBottom: 120,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
  },
  breadcrumbRow: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minHeight: 30,
  },
  breadcrumbText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  breadcrumbTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  breadcrumbDivider: {
    color: Colors.outline,
    marginHorizontal: Spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sortChip: {
    borderRadius: BorderRadius.full,
  },
  sortChipActive: {
    backgroundColor: Colors.transparent,
  },
  sortChipText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#111111',
  },
  uploadWrap: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  uploadCard: {
    borderRadius: 12,
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 3,
    borderColor: '#111111',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadText: {
    flex: 1,
    marginLeft: Spacing.sm,
    color: Colors.onSecondaryContainer,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  syncRow: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  syncBtn: {
    flex: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  syncBtnText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  sectionHeader: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  folderList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  newFolderCard: {
    width: 118,
    height: 96,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  newFolderText: {
    marginTop: 6,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  folderCard: {
    width: 132,
    height: 96,
    borderRadius: 12,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 3,
    borderColor: '#110e05',
    padding: Spacing.sm,
    marginRight: Spacing.md,
    justifyContent: 'space-between',
  },
  folderName: {
    color: '#000000',
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  folderMeta: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  fileList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  fileCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: '#110e05',
  },
  fileMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileTextWrap: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  fileName: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  fileMeta: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
  },
  recentList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  recentCard: {
    width: 190,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 3,
    borderColor: '#111111',
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  recentName: {
    marginTop: 4,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  recentMeta: {
    marginTop: 2,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.md,
    fontWeight: '700',
  },
  emptySubtitle: {
    marginTop: Spacing.xs,
    color: Colors.outline,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
  emptyInline: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyInlineText: {
    color: Colors.outline,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
  },
  fabWrap: {
    position: 'absolute',
    right: 22,
    bottom: 22,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primaryContainer,
    borderWidth: 4,
    borderColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 4,
    borderColor: '#111111',
    padding: Spacing.lg,
  },
  modalTitle: {
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.size.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  modalInput: {
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: Spacing.md,
    color: Colors.onSurface,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.md,
    marginBottom: Spacing.md,
  },
  modalTypeList: {
    paddingBottom: Spacing.md,
  },
  typeChip: {
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: Spacing.sm,
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  typeChipText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: Colors.primary,
  },
  modalCancelButton: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: '#111111',
    backgroundColor: Colors.surfaceLow,
  },
  modalCancelText: {
    color: Colors.onSurfaceVariant,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.sm,
    fontWeight: '700',
  },
  loadingBadge: {
    position: 'absolute',
    top: 40,
    right: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 1,
    borderColor: `${Colors.primary}55`,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  loadingText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.size.xs,
    fontWeight: '700',
  },
});
