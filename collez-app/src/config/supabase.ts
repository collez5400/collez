import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from '../models/database.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const isLikelyJwt = SUPABASE_ANON_KEY.split('.').length === 3;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

if (!isLikelyJwt) {
  throw new Error(
    'Invalid EXPO_PUBLIC_SUPABASE_ANON_KEY format. Ensure Vercel/Expo env has the full anon JWT key.'
  );
}

const webStorage =
  typeof window !== 'undefined' && window.localStorage
    ? {
        getItem: (key: string) => window.localStorage.getItem(key),
        setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
        removeItem: (key: string) => window.localStorage.removeItem(key),
      }
    : undefined;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

// Typed helper for error wrapping
export async function supabaseQuery<T>(
  fn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await fn();
  if (error) throw new Error(error.message ?? 'Supabase query failed');
  if (data === null) throw new Error('No data returned');
  return data;
}
