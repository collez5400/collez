import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { User } from '../models/user';
import { supabase } from '../config/supabase';
import {
  signInWithGoogle,
  signInWithApple,
  signOut as authSignOut,
  restoreSession,
  fetchUserProfile,
  ensureUserProfileFromAuthUser,
  updateUserProfile,
} from '../services/authService';
import { registerForPushNotifications } from '../services/notificationService';
import { useVaultStore } from './vaultStore';
import { useRemoteConfigStore } from './remoteConfigStore';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'onboarding'
  | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;

  // Actions
  signIn: (provider?: 'google' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  completeOnboarding: (profileUpdates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  user: null,
  session: null,
  error: null,

  signIn: async (provider = 'google') => {
    set({ status: 'loading', error: null });
    try {
      if (Platform.OS === 'web' && provider !== 'google') {
        throw new Error('Apple sign in is only available on iOS.');
      }

      if (Platform.OS === 'web') {
        await signInWithGoogle();
        return;
      }

      const { user, isNew } =
        provider === 'apple' ? await signInWithApple() : await signInWithGoogle();
      const { data } = await supabase.auth.getSession();

      set({
        user,
        session: data.session,
        status: isNew || !user.onboarding_complete ? 'onboarding' : 'authenticated',
        error: null,
      });

      // Request notification permissions after first login (native only).
      // Safe to call repeatedly; OS prompts at most once.
      void registerForPushNotifications(user.id);
      void useVaultStore.getState().syncFromCloud();
      void useRemoteConfigStore.getState().refreshConfig(true);
    } catch (err: any) {
      set({ status: 'unauthenticated', error: err.message ?? 'Sign in failed' });
    }
  },

  signOut: async () => {
    set({ status: 'loading' });
    try {
      await authSignOut();
    } finally {
      set({ status: 'unauthenticated', user: null, session: null, error: null });
    }
  },

  restoreSession: async () => {
    set({ status: 'loading' });
    try {
      const session = await restoreSession();
      if (!session) {
        set({ status: 'unauthenticated' });
        return;
      }

      const user =
        (await fetchUserProfile(session.user.id)) ??
        (await ensureUserProfileFromAuthUser(session.user));
      if (!user) {
        set({ status: 'unauthenticated' });
        return;
      }

      set({
        session,
        user,
        status: user.onboarding_complete ? 'authenticated' : 'onboarding',
      });

      void registerForPushNotifications(user.id);
      void useVaultStore.getState().syncFromCloud();
      void useRemoteConfigStore.getState().refreshConfig(true);
    } catch {
      set({ status: 'unauthenticated' });
    }
  },

  completeOnboarding: async (profileUpdates: Partial<User>) => {
    const { user } = get();
    if (!user) return;
    set({ status: 'loading' });
    try {
      await updateUserProfile(user.id, {
        ...profileUpdates,
        onboarding_complete: true,
      });
      set({
        user: { ...user, ...profileUpdates, onboarding_complete: true },
        status: 'authenticated',
      });
    } catch (err: any) {
      set({ status: 'onboarding', error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
