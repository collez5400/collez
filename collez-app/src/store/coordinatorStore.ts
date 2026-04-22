import { create } from 'zustand';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../config/supabase';
import type { CoordinatorApplication, CoordinatorApplicationStatus } from '../models/coordinator';
import { useAuthStore } from './authStore';
import { useUserStore } from './userStore';

const COORDINATOR_BUCKET = 'coordinator-applications';

type Eligibility = {
  ok: boolean;
  reasons: string[];
};

function daysSince(iso: string | null | undefined) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

function computeEligibility(input: {
  streakCount: number;
  xp: number;
  createdAt: string | null;
  hasCollege: boolean;
  collegeApproved: boolean | null;
}): Eligibility {
  const reasons: string[] = [];

  if (input.streakCount < 30) reasons.push('Need a 30+ day streak');
  if (input.xp < 100) reasons.push('Need 100+ XP (Grinder rank)');
  if (daysSince(input.createdAt) < 30) reasons.push('Account must be 30+ days old');
  if (!input.hasCollege) reasons.push('Select an approved college in onboarding');
  if (input.collegeApproved === false) reasons.push('Your college is not approved yet');

  return { ok: reasons.length === 0, reasons };
}

async function uploadImagePath(params: {
  userId: string;
  kind: 'college_id' | 'selfie';
  uri: string;
}) {
  const response = await fetch(params.uri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const ext = params.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const objectPath = `${params.userId}/${params.kind}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(COORDINATOR_BUCKET).upload(objectPath, arrayBuffer, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;

  // Store as "bucket/path" so admin can create signed URLs.
  return `${COORDINATOR_BUCKET}/${objectPath}`;
}

interface CoordinatorStoreState {
  application: CoordinatorApplication | null;
  eligibility: Eligibility | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchMyApplication: () => Promise<CoordinatorApplication | null>;
  refreshEligibility: () => Promise<Eligibility>;
  submitApplication: (input: {
    fullName: string;
    whatsappNumber: string;
    email: string;
    reason: string;
    collegeIdPhoto: ImagePicker.ImagePickerAsset;
    selfie: ImagePicker.ImagePickerAsset;
  }) => Promise<boolean>;
  clearError: () => void;
}

export const useCoordinatorStore = create<CoordinatorStoreState>((set, get) => ({
  application: null,
  eligibility: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchMyApplication: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return null;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('coordinator_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const application = (data ?? null) as CoordinatorApplication | null;
      set({ application, isLoading: false });
      return application;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load coordinator application',
      });
      return null;
    }
  },

  refreshEligibility: async () => {
    const profile = useUserStore.getState().profile ?? (await useUserStore.getState().fetchProfile());

    const streakCount = profile?.streak_count ?? 0;
    const xp = profile?.xp ?? 0;
    const createdAt = profile?.created_at ?? null;
    const hasCollege = Boolean(profile?.college_id);

    let collegeApproved: boolean | null = null;
    if (profile?.college_id) {
      const { data } = await supabase.from('colleges').select('is_approved').eq('id', profile.college_id).maybeSingle();
      collegeApproved = (data as any)?.is_approved ?? null;
    }

    const eligibility = computeEligibility({
      streakCount,
      xp,
      createdAt,
      hasCollege,
      collegeApproved,
    });

    set({ eligibility });
    return eligibility;
  },

  submitApplication: async (input) => {
    const userId = useAuthStore.getState().user?.id;
    const profile = useUserStore.getState().profile ?? (await useUserStore.getState().fetchProfile());
    if (!userId || !profile) return false;
    if (!profile.college_id) {
      set({ error: 'No college selected. Complete onboarding to pick a college.' });
      return false;
    }

    const eligibility = await get().refreshEligibility();
    if (!eligibility.ok) {
      set({ error: `Not eligible yet: ${eligibility.reasons.join(', ')}` });
      return false;
    }

    set({ isSubmitting: true, error: null });
    try {
      const collegeIdPhotoUrl = await uploadImagePath({
        userId,
        kind: 'college_id',
        uri: input.collegeIdPhoto.uri,
      });
      const selfieUrl = await uploadImagePath({
        userId,
        kind: 'selfie',
        uri: input.selfie.uri,
      });

      const now = new Date().toISOString();
      const { error } = await supabase.from('coordinator_applications').insert({
        user_id: userId,
        college_id: profile.college_id,
        full_name: input.fullName.trim(),
        whatsapp_number: input.whatsappNumber.trim(),
        email: input.email.trim().toLowerCase(),
        reason: input.reason.trim(),
        college_id_photo_url: collegeIdPhotoUrl,
        selfie_url: selfieUrl,
        status: 'pending' as CoordinatorApplicationStatus,
        created_at: now,
      } as any);

      if (error) throw error;

      await get().fetchMyApplication();
      set({ isSubmitting: false });
      return true;
    } catch (err) {
      set({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Failed to submit coordinator application',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

