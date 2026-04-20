import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { User } from '../models/user';
import { supabase } from '../config/supabase';
import {
  signInWithGoogle,
  signOut as authSignOut,
  restoreSession,
  fetchUserProfile,
  updateUserProfile,
} from '../services/authService';

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
  signIn: () => Promise<void>;
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

  signIn: async () => {
    set({ status: 'loading', error: null });
    try {
      const { user, isNew } = await signInWithGoogle();
      const { data } = await supabase.auth.getSession();

      set({
        user,
        session: data.session,
        status: isNew || !user.onboarding_complete ? 'onboarding' : 'authenticated',
        error: null,
      });
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

      const user = await fetchUserProfile(session.user.id);
      if (!user) {
        set({ status: 'unauthenticated' });
        return;
      }

      set({
        session,
        user,
        status: user.onboarding_complete ? 'authenticated' : 'onboarding',
      });
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
    }
  },

  clearError: () => set({ error: null }),
}));
