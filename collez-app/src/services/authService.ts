import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';
import { User } from '../models/user';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
const SESSION_KEY = 'collez_session';

// Configure Google Sign-In once at app startup
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
}

/** Sign in with Google and exchange the ID token with Supabase. */
export async function signInWithGoogle(): Promise<{ user: User; isNew: boolean }> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const googleResponse = await GoogleSignin.signIn();

  if (!googleResponse.data?.idToken) {
    throw new Error('Google Sign-In did not return an ID token.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: googleResponse.data.idToken,
  });

  if (error) throw new Error(`Supabase auth error: ${error.message}`);
  if (!data.user) throw new Error('No user returned from Supabase auth.');

  // Persist the session token
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data.session));

  // Check if user record exists in public.users
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profile) {
    return { user: profile as User, isNew: false };
  }

  // New user — create a minimal profile record
  const newUser: Partial<User> = {
    id: data.user.id,
    email: data.user.email ?? '',
    full_name: data.user.user_metadata?.full_name ?? '',
    avatar_url: data.user.user_metadata?.avatar_url ?? null,
    xp: 0,
    daily_xp_earned: 0,
    streak_count: 0,
    longest_streak: 0,
    is_coordinator: false,
    is_banned: false,
    onboarding_complete: false,
  };

  const { data: created, error: createError } = await supabase
    .from('users')
    // @ts-expect-error type shim limitations for Supabase
    .insert(newUser)
    .select()
    .single();

  if (createError) throw new Error(`Failed to create user: ${createError.message}`);

  return { user: created as User, isNew: true };
}

/** Restore session from SecureStore on app launch. */
export async function restoreSession() {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  const session = JSON.parse(raw);
  const { data, error } = await supabase.auth.setSession(session);
  if (error || !data.session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
  return data.session;
}

/** Sign out from both Google and Supabase. */
export async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch (_) {
    // Google sign-out is best-effort
  }
  await supabase.auth.signOut();
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

/** Fetch the authenticated user's profile from Supabase. */
export async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data as User;
}

/** Update specific fields on the user's profile. */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<void> {
  const { error } = await supabase
    .from('users')
    // @ts-expect-error type shim limitations for Supabase
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw new Error(`Profile update failed: ${error.message}`);
}
