import { User } from '../models/user';
import { supabase } from '../config/supabase';

export type UserSegment = 'coordinator' | 'premium' | 'non_premium' | 'new_users_7d';

export interface FeatureFlagRule {
  default: boolean;
  segments?: Partial<Record<UserSegment, boolean>>;
}

export interface ExperimentRule {
  enabled: boolean;
  variants: Record<string, number>;
}

export interface RemoteConfigPayload {
  featureFlags: Record<string, FeatureFlagRule>;
  experiments: Record<string, ExperimentRule>;
}

const EMPTY_REMOTE_CONFIG: RemoteConfigPayload = {
  featureFlags: {},
  experiments: {},
};

function toBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function deriveSegments(user: User): UserSegment[] {
  const createdAt = new Date(user.created_at).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const isPremium = Boolean(user.premium_config?.unlocked_themes?.length);

  const segments: UserSegment[] = [
    user.is_coordinator ? 'coordinator' : null,
    isPremium ? 'premium' : 'non_premium',
    createdAt >= sevenDaysAgo ? 'new_users_7d' : null,
  ].filter(Boolean) as UserSegment[];

  return segments;
}

function normalizeFeatureFlags(raw: unknown): Record<string, FeatureFlagRule> {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const result: Record<string, FeatureFlagRule> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!value || typeof value !== 'object') continue;
    const rule = value as Record<string, unknown>;
    result[key] = {
      default: toBoolean(rule.default, false),
      segments: (rule.segments as Partial<Record<UserSegment, boolean>> | undefined) ?? {},
    };
  }

  return result;
}

function normalizeExperiments(raw: unknown): Record<string, ExperimentRule> {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const result: Record<string, ExperimentRule> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!value || typeof value !== 'object') continue;
    const rule = value as Record<string, unknown>;
    const variants = (rule.variants as Record<string, number> | undefined) ?? {};
    result[key] = {
      enabled: toBoolean(rule.enabled, false),
      variants,
    };
  }

  return result;
}

export async function fetchRemoteConfig(): Promise<RemoteConfigPayload> {
  const { data, error } = await supabase
    .from('app_config_entries')
    .select('key, value')
    .in('key', ['feature_flags', 'ab_experiments']);

  if (error) {
    return EMPTY_REMOTE_CONFIG;
  }

  const map = new Map<string, unknown>();
  for (const row of (data ?? []) as Array<{ key: string; value: unknown }>) {
    map.set(String(row.key), row.value);
  }

  return {
    featureFlags: normalizeFeatureFlags(map.get('feature_flags')),
    experiments: normalizeExperiments(map.get('ab_experiments')),
  };
}

export function isFeatureEnabled(
  featureKey: string,
  user: User | null,
  config: RemoteConfigPayload
): boolean {
  const rule = config.featureFlags[featureKey];
  if (!rule) return false;
  if (!user) return rule.default;

  const segments = deriveSegments(user);
  for (const segment of segments) {
    if (typeof rule.segments?.[segment] === 'boolean') {
      return Boolean(rule.segments?.[segment]);
    }
  }
  return rule.default;
}

function hashToBucket(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash % 100;
}

export function getExperimentVariant(
  testKey: string,
  user: User | null,
  config: RemoteConfigPayload
): string | null {
  const rule = config.experiments[testKey];
  if (!rule?.enabled || !user) return null;

  const entries = Object.entries(rule.variants).filter(([, weight]) => Number(weight) > 0);
  if (!entries.length) return null;

  const bucket = hashToBucket(`${user.id}:${testKey}`);
  let cumulative = 0;
  for (const [variant, weight] of entries) {
    cumulative += Number(weight);
    if (bucket < cumulative) return variant;
  }
  return entries[entries.length - 1][0];
}

export async function trackAbTestExposure(
  userId: string,
  testKey: string,
  variant: string,
  context: Record<string, unknown> = {}
) {
  // @ts-expect-error table is introduced in a later migration than local generated types.
  await supabase.from('ab_test_events').insert({
    user_id: userId,
    test_key: testKey,
    variant,
    context,
  });
}
