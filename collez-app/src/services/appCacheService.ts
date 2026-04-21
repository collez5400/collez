import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from './sqliteService';

const LAST_FETCHED_PREFIX = 'last_fetched_at_';

const escapeSqlString = (value: string) => value.replace(/'/g, "''");

export async function setCachedValue<T>(key: string, value: T, ttlMs?: number): Promise<void> {
  const db = await getDb();
  const now = new Date();
  const expiresAt = ttlMs ? new Date(now.getTime() + ttlMs).toISOString() : null;
  const payload = JSON.stringify(value);
  const escapedKey = escapeSqlString(key);

  await db.runAsync(
    `
      INSERT INTO app_cache (key, value, expires_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at
    `,
    [escapedKey, payload, expiresAt, now.toISOString()]
  );
}

export async function getCachedValue<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const escapedKey = escapeSqlString(key);
  const row = await db.getFirstAsync<{ value: string; expires_at: string | null }>(
    `SELECT value, expires_at FROM app_cache WHERE key = '${escapedKey}' LIMIT 1`
  );

  if (!row) return null;
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;

  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function shouldFetchByTimestamp(cacheKey: string, ttlMs: number, forceRefresh = false): Promise<boolean> {
  if (forceRefresh) return true;
  const raw = await AsyncStorage.getItem(`${LAST_FETCHED_PREFIX}${cacheKey}`);
  if (!raw) return true;
  const lastFetched = Number(raw);
  if (!Number.isFinite(lastFetched)) return true;
  return Date.now() - lastFetched >= ttlMs;
}

export async function markFetched(cacheKey: string): Promise<void> {
  await AsyncStorage.setItem(`${LAST_FETCHED_PREFIX}${cacheKey}`, String(Date.now()));
}
