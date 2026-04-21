import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { User } from '../models/user';
import { Badge } from '../models/database.types';
import { useAuthStore } from './authStore';

const USERNAME_CHANGE_COOLDOWN_DAYS = 30;

type PublicProfile = User & {
  college_name: string | null;
};

interface UpdateProfileInput {
  full_name?: string;
  username?: string;
}


interface UserStoreState {
  profile: PublicProfile | null;
  badges: Badge[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  usernameCanChange: boolean;
  usernameChangeAvailableInDays: number;
  fetchProfile: (userId?: string) => Promise<PublicProfile | null>;
  fetchBadges: (userId?: string) => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<boolean>;
  uploadAvatar: (uri: string) => Promise<string | null>;
  clearError: () => void;
}

function getDaysSinceUpdated(updatedAt?: string | null) {
  if (!updatedAt) return USERNAME_CHANGE_COOLDOWN_DAYS;
  const updatedDate = new Date(updatedAt).getTime();
  const now = Date.now();
  if (Number.isNaN(updatedDate)) return USERNAME_CHANGE_COOLDOWN_DAYS;
  return Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
}

function toPublicUrl(path: string) {
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  profile: null,
  badges: [],
  isLoading: false,
  isUpdating: false,
  error: null,
  usernameCanChange: true,
  usernameChangeAvailableInDays: 0,

  fetchProfile: async (userId) => {
    const targetUserId = userId ?? useAuthStore.getState().user?.id;
    if (!targetUserId) return null;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, colleges(name)')
        .eq('id', targetUserId)
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'Failed to fetch user profile');
      }

      const collegeName = (data as any).colleges?.name ?? null;
      const profile = {
        ...(data as unknown as User),
        college_name: collegeName,
      } as PublicProfile;

      const daysSinceUpdate = getDaysSinceUpdated(profile.updated_at);
      const canChange = daysSinceUpdate >= USERNAME_CHANGE_COOLDOWN_DAYS;
      const daysRemaining = canChange ? 0 : USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceUpdate;

      set({
        profile,
        isLoading: false,
        usernameCanChange: canChange,
        usernameChangeAvailableInDays: daysRemaining,
      });

      if (!userId) {
        const authState = useAuthStore.getState();
        if (authState.user) {
          useAuthStore.setState({
            user: {
              ...authState.user,
              ...profile,
            },
          });
        }
      }

      return profile;
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch user profile',
      });
      return null;
    }
  },

  fetchBadges: async (userId) => {
    const targetUserId = userId ?? useAuthStore.getState().user?.id;
    if (!targetUserId) return;

    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', targetUserId)
      .order('earned_at', { ascending: false });

    if (error) {
      set({ error: error.message });
      return;
    }

    set({ badges: (data ?? []) as Badge[] });
  },

  updateProfile: async (payload) => {
    const currentProfile = get().profile;
    if (!currentProfile) return false;

    const updateBody: Record<string, string> = {};
    const trimmedName = payload.full_name?.trim();
    const trimmedUsername = payload.username?.trim();

    if (trimmedName && trimmedName !== currentProfile.full_name) {
      updateBody.full_name = trimmedName;
    }

    if (trimmedUsername && trimmedUsername !== currentProfile.username) {
      if (!get().usernameCanChange) {
        set({
          error: `Username can be changed after ${get().usernameChangeAvailableInDays} day(s).`,
        });
        return false;
      }
      updateBody.username = trimmedUsername;
    }

    if (!Object.keys(updateBody).length) return true;

    set({ isUpdating: true, error: null });
    const { error } = await supabase
      .from('users')
      // @ts-expect-error supabase update typing
      .update({ ...updateBody, updated_at: new Date().toISOString() })
      .eq('id', currentProfile.id);

    if (error) {
      set({ isUpdating: false, error: error.message });
      return false;
    }

    await get().fetchProfile(currentProfile.id);
    set({ isUpdating: false });
    return true;
  },

  uploadAvatar: async (uri) => {
    const currentProfile = get().profile;
    if (!currentProfile) return null;

    set({ isUpdating: true, error: null });
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${currentProfile.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, {
          contentType: blob.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const publicUrl = toPublicUrl(path);

      const { error: profileUpdateError } = await supabase
        .from('users')
        // @ts-expect-error supabase update typing
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', currentProfile.id);

      if (profileUpdateError) throw profileUpdateError;

      await get().fetchProfile(currentProfile.id);
      set({ isUpdating: false });
      return publicUrl;
    } catch (err) {
      set({
        isUpdating: false,
        error: err instanceof Error ? err.message : 'Avatar upload failed',
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
