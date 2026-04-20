import { MaterialIcons } from '@expo/vector-icons';

export type RankTier =
  | 'fresher'
  | 'grinder'
  | 'scholar'
  | 'strategist'
  | 'elite'
  | 'titan'
  | 'campus_legend'
  | 'state_hero'
  | 'national_icon';

export interface RankMeta {
  tier: RankTier;
  label: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  threshold: number;
}

const RANK_ORDER: RankMeta[] = [
  { tier: 'fresher', label: 'Fresher', color: '#8D90A0', icon: 'school', threshold: 0 },
  { tier: 'grinder', label: 'Grinder', color: '#CD7F32', icon: 'local-fire-department', threshold: 100 },
  { tier: 'scholar', label: 'Scholar', color: '#C0C0C0', icon: 'menu-book', threshold: 500 },
  { tier: 'strategist', label: 'Strategist', color: '#FFD700', icon: 'psychology', threshold: 1500 },
  { tier: 'elite', label: 'Elite', color: '#E5E4E2', icon: 'workspace-premium', threshold: 4000 },
  { tier: 'titan', label: 'Titan', color: '#8FE3FF', icon: 'diamond', threshold: 10000 },
  { tier: 'campus_legend', label: 'Campus Legend', color: '#E0115F', icon: 'auto-awesome', threshold: 25000 },
  { tier: 'state_hero', label: 'State Hero', color: '#50C878', icon: 'military-tech', threshold: 60000 },
  { tier: 'national_icon', label: 'National Icon', color: '#4B0082', icon: 'public', threshold: 150000 },
];

export function getRankTier(xp: number): RankTier {
  if (xp >= 150000) return 'national_icon';
  if (xp >= 60000) return 'state_hero';
  if (xp >= 25000) return 'campus_legend';
  if (xp >= 10000) return 'titan';
  if (xp >= 4000) return 'elite';
  if (xp >= 1500) return 'strategist';
  if (xp >= 500) return 'scholar';
  if (xp >= 100) return 'grinder';
  return 'fresher';
}

export function getRankMeta(tier: RankTier): RankMeta {
  return RANK_ORDER.find((item) => item.tier === tier) ?? RANK_ORDER[0];
}

export function xpToNextRank(xp: number): number {
  const thresholds = RANK_ORDER.map((item) => item.threshold).filter((value) => value > xp);
  if (!thresholds.length) return 0;
  return thresholds[0] - xp;
}

export function getRankProgress(xp: number): number {
  const tier = getRankTier(xp);
  const current = getRankMeta(tier);
  const currentIndex = RANK_ORDER.findIndex((item) => item.tier === tier);
  const next = RANK_ORDER[currentIndex + 1];
  if (!next) return 1;
  const denominator = next.threshold - current.threshold;
  if (denominator <= 0) return 1;
  return Math.max(0, Math.min(1, (xp - current.threshold) / denominator));
}
