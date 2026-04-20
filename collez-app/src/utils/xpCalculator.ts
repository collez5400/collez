import { XP_LIMITS } from '../config/constants';

export function calculateCollegeScore(totalStudentXp: number, studentCount: number): number {
  if (studentCount <= 0) return 0;
  return totalStudentXp / Math.sqrt(studentCount);
}

export function applyDailyXpCap(earned: number, dailyEarned: number): number {
  const remaining = Math.max(0, XP_LIMITS.DAILY_CAP - dailyEarned);
  return Math.max(0, Math.min(earned, remaining));
}
