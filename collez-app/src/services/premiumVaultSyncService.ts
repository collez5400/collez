import { v4 as uuidv4 } from 'uuid';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { supabase } from '../config/supabase';

export type PremiumVaultCloudFile = {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
};

export async function uploadVaultFileToCloud(params: {
  userId: string;
  localUri: string;
  filename: string;
  sizeBytes: number;
}): Promise<PremiumVaultCloudFile | null> {
  const extension = params.filename.toLowerCase().endsWith('.pdf') ? 'pdf' : 'pdf';
  const storagePath = `${params.userId}/${uuidv4()}.${extension}`;

  const response = await fetch(params.localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('premium-vault')
    .upload(storagePath, arrayBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: params.userId,
    filename: params.filename,
    storage_path: storagePath,
    size_bytes: params.sizeBytes,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('premium_vault_files')
    // @ts-expect-error Supabase manual typings
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to save cloud metadata');
  }

  return data as PremiumVaultCloudFile;
}

export async function listPremiumVaultCloudFiles(userId: string): Promise<PremiumVaultCloudFile[]> {
  const { data, error } = await supabase
    .from('premium_vault_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PremiumVaultCloudFile[];
}

export async function downloadVaultFileFromCloud(params: {
  storagePath: string;
  destinationUri: string;
}) {
  const { data, error } = await supabase.storage
    .from('premium-vault')
    .createSignedUrl(params.storagePath, 60 * 10);

  if (error || !data) {
    throw new Error(error?.message ?? 'Cloud download failed');
  }
  await LegacyFileSystem.downloadAsync(data.signedUrl, params.destinationUri);
}
