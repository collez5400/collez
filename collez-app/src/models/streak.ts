export type StreakActionType =
  | 'app_open'
  | 'timetable_view'
  | 'task_complete'
  | 'trivia'
  | 'leaderboard_view'
  | 'quote_read';

export interface StreakData {
  count: number;
  lastActiveDate: string | null;
  longestStreak: number;
  shields: number;
  shieldActive: boolean;
}

export interface StreakMilestone {
  day: number;
  badgeName: string;
  icon: string;
  badgeType: string;
}
