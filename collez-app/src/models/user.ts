import { RANK_TIERS } from '../config/constants';

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
  is_banned: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface RankTier {
  level: number;
  name: string;
  threshold: number;
  icon: string;
}

/** Returns the highest rank tier the user qualifies for based on their XP. */
export function getRankTier(xp: number): RankTier {
  let current = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (xp >= tier.threshold) {
      current = tier;
    }
  }
  return current;
}

/** Returns XP needed to reach the next rank tier. Returns 0 if at max tier. */
export function xpToNextRank(xp: number): number {
  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (xp < RANK_TIERS[i].threshold) {
      return RANK_TIERS[i].threshold - xp;
    }
  }
  return 0; // Max rank reached
}

/** Returns 0-1 progress ratio within the current rank tier. */
export function rankProgress(xp: number): number {
  const current = getRankTier(xp);
  const nextIndex = RANK_TIERS.findIndex(t => t.level === current.level + 1);
  if (nextIndex === -1) return 1; // Max rank
  const next = RANK_TIERS[nextIndex];
  return (xp - current.threshold) / (next.threshold - current.threshold);
}
