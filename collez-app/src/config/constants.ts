export const XP_VALUES = {
  DAILY_LOGIN: 2,
  TRIVIA_CORRECT: 5,
  TASK_COMPLETE: 0, // tasks don't give XP, just maintain streak
  TREASURE_HUNT: 40,
  EVENT_BONUS: 50,
};

export const XP_LIMITS = {
  DAILY_CAP: 100,
};

export const RANK_TIERS = [
  { level: 1, name: 'Fresher', threshold: 0, icon: 'school' },
  { level: 2, name: 'Grinder', threshold: 100, icon: 'local-fire-department' },
  { level: 3, name: 'Scholar', threshold: 500, icon: 'menu-book' },
  { level: 4, name: 'Strategist', threshold: 1000, icon: 'psychology' },
  { level: 5, name: 'Specialist', threshold: 2500, icon: 'workspace-premium' },
  { level: 6, name: 'Elite', threshold: 5000, icon: 'military-tech' },
  { level: 7, name: 'Master', threshold: 10000, icon: 'diamond' },
  { level: 8, name: 'Legend', threshold: 25000, icon: 'crown' },
  { level: 9, name: 'National Icon', threshold: 50000, icon: 'public' },
];

export const STREAK_MILESTONES = [
  { days: 7, name: 'Week Warrior', icon: 'flame-outline', level: 'bronze' },
  { days: 30, name: 'Monthly Grinder', icon: 'flame', level: 'silver' },
  { days: 60, name: 'Consistency King', icon: 'flash', level: 'gold' },
  { days: 100, name: 'Century Scholar', icon: 'ribbon', level: 'diamond' },
  { days: 180, name: 'Half-Year Hero', icon: 'trophy', level: 'platinum' },
  { days: 365, name: 'Glory Legend', icon: 'crown', level: 'mythic' },
];

export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,     // 5 minutes (Leaderboards)
  MEDIUM: 15 * 60 * 1000,   // 15 minutes (Events)
  LONG: 24 * 60 * 60 * 1000 // 24 hours (Quotes, Profile static data)
};

export const TIMETABLE_COLORS = [
  '#B4C5FF', // primary
  '#86EAD4', // secondary
  '#D0BCFF', // tertiary
  '#FFB4AB', // error
  '#4ADE80', // success
  '#FBBF24', // warning
];
