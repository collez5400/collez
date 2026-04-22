import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { User } from '../models/user';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const OAUTH_REDIRECT_URL = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL;
const SESSION_KEY = 'collez_session';
let isGoogleConfigured = false;

async function getOrCreateUserProfile(authUser: SupabaseAuthUser): Promise<{ user: User; isNew: boolean }> {
  const existing = await fetchUserProfile(authUser.id);
  if (existing) {
    return { user: existing, isNew: false };
  }

  const created = await ensureUserProfileFromAuthUser(authUser);
  if (!created) {
    throw new Error('Failed to create user profile after authentication.');
  }
  return { user: created, isNew: true };
}

function deriveUsername(authUser: SupabaseAuthUser): string {
  const fromMetadata = (authUser.user_metadata?.user_name ?? authUser.user_metadata?.username ?? '')
    .toString()
    .trim();
  if (fromMetadata) return fromMetadata.slice(0, 32);

  const emailPrefix = (authUser.email ?? '')
    .split('@')[0]
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .trim();
  if (emailPrefix) return emailPrefix.slice(0, 32);

  return `user_${authUser.id.slice(0, 8)}`;
}

function buildNewUserProfile(authUser: SupabaseAuthUser): Partial<User> {
  const inviteCode = `CLZ${authUser.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    full_name: authUser.user_metadata?.full_name ?? '',
    username: deriveUsername(authUser),
    avatar_url: authUser.user_metadata?.avatar_url ?? null,
    xp: 0,
    daily_xp_earned: 0,
    streak_count: 0,
    longest_streak: 0,
    is_coordinator: false,
    is_banned: false,
    onboarding_complete: false,
    push_token: null,
    push_enabled: true,
    push_streak_enabled: true,
    push_event_enabled: true,
    invite_code: inviteCode,
  };
}

// Configure Google Sign-In once at app startup
export function configureGoogleSignIn() {
  if (Platform.OS === 'web') {
    // Web uses OAuth redirect flow; native Google Sign-In SDK is not required.
    return;
  }

  if (!GOOGLE_WEB_CLIENT_ID || GOOGLE_WEB_CLIENT_ID.includes('your-google-web-client-id')) {
    console.warn(
      'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Google sign-in will fail until this env var is set.'
    );
    return;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
  isGoogleConfigured = true;
}

/** Sign in with Google and exchange the ID token with Supabase. */
export async function signInWithGoogle(): Promise<{ user: User; isNew: boolean }> {
  if (Platform.OS === 'web') {
    const redirectTo =
      OAUTH_REDIRECT_URL ||
      (typeof window !== 'undefined' ? window.location.origin : undefined);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) throw new Error(`Google web auth error: ${error.message}`);
    return { user: null as unknown as User, isNew: false };
  }

  try {
    if (!isGoogleConfigured) {
      configureGoogleSignIn();
    }
    if (!isGoogleConfigured) {
      throw new Error(
        'Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Add your real Google OAuth Web Client ID in .env.'
      );
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const googleResponse = await GoogleSignin.signIn();
    const idToken =
      googleResponse.data?.idToken ??
      // Backward compatibility with older Google Sign-In response shape.
      (googleResponse as any).idToken;

    if (!idToken) {
      throw new Error('Google Sign-In did not return an ID token.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw new Error(`Supabase auth error: ${error.message}`);
    if (!data.user) throw new Error('No user returned from Supabase auth.');

    return await getOrCreateUserProfile(data.user);
  } catch (error: any) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Google sign in was cancelled.');
    }
    if (error?.code === statusCodes.IN_PROGRESS) {
      throw new Error('Google sign in is already in progress.');
    }
    if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services are not available or outdated.');
    }
    throw error;
  }
}

/** Sign in with Apple (iOS only) and exchange identity token with Supabase. */
export async function signInWithApple(): Promise<{ user: User; isNew: boolean }> {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple sign in is only available on iOS.');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign-In did not return an identity token.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw new Error(`Supabase Apple auth error: ${error.message}`);
  if (!data.user) throw new Error('No user returned from Supabase Apple auth.');

  return await getOrCreateUserProfile(data.user);
}

/** Restore session from SecureStore on app launch. */
export async function restoreSession() {
  // Supabase already persists session via configured storage (AsyncStorage/web storage).
  // Prefer this source to avoid stale-token drift with our legacy SecureStore copy.
  const { data, error } = await supabase.auth.getSession();
  if (!error && data.session) {
    return data.session;
  }

  if (Platform.OS === 'web') {
    return null;
  }

  // Migration fallback for older app versions that wrote sessions to SecureStore.
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const legacySession = JSON.parse(raw);
    const { data: restored, error: restoreError } = await supabase.auth.setSession(legacySession);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    if (restoreError || !restored.session) {
      return null;
    }
    return restored.session;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
}

/** Sign out from both Google and Supabase. */
export async function signOut() {
  if (Platform.OS === 'web') {
    await supabase.auth.signOut();
    return;
  }

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
    .maybeSingle();

  if (error || !data) return null;
  return data as User;
}

/** Ensure a profile exists for the authenticated user (especially needed on web OAuth). */
export async function ensureUserProfileFromAuthUser(
  authUser: SupabaseAuthUser
): Promise<User | null> {
  const existing = await fetchUserProfile(authUser.id);
  if (existing) {
    return existing;
  }

  const newUser = buildNewUserProfile(authUser);
  const { data, error } = await supabase
    .from('users')
    // @ts-expect-error type shim limitations for Supabase
    .insert(newUser)
    .select()
    .single();

  if (error || !data) {
    const minimalUser = {
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: authUser.user_metadata?.full_name ?? '',
      username: deriveUsername(authUser),
      avatar_url: authUser.user_metadata?.avatar_url ?? null,
    };
    const fallbackResult: any = await supabase
      .from('users')
      // @ts-expect-error type shim limitations for Supabase
      .insert(minimalUser)
      .select()
      .single();
    if (fallbackResult.error || !fallbackResult.data) {
      return null;
    }
    return fallbackResult.data as User;
  }

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
