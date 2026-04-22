import { RankTier, getRankTier as resolveRankTier, xpToNextRank as getXpToNextRank } from '../utils/rankCalculator';

export interface PremiumConfig {
  active_theme?: string;
  unlocked_themes?: string[];
}

export interface User {
  id: string;                      // UUID from Supabase Auth
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  college_id: string | null;
  xp: number;
  daily_xp_earned: number;
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null; // ISO date string
  is_coordinator: boolean;
  coordinator_type?: 'college' | 'city' | 'state' | null;
  coordinator_region?: string | null;
  is_banned: boolean;
  onboarding_complete: boolean;
  marketing_consent?: boolean;
  push_token?: string | null;
  push_enabled?: boolean;
  push_streak_enabled?: boolean;
  push_event_enabled?: boolean;
  streak_shields?: number;
  streak_shield_active?: boolean;
  premium_config?: PremiumConfig | null;
  invite_code?: string | null;
  referred_by?: string | null;
  created_at: string;
  updated_at: string;
}

/** Returns the canonical rank tier slug for a user XP value. */
export function getRankTier(xp: number): RankTier {
  return resolveRankTier(xp);
}

/** Returns XP needed to reach the next rank tier. */
export function xpToNextRank(xp: number): number {
  return getXpToNextRank(xp);
}
