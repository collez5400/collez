import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { supabase } from '../config/supabase';
import { STREAK_MILESTONES } from '../config/constants';
import { StreakActionType, StreakMilestone } from '../models/streak';

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = 'Asia/Kolkata';
const supabaseClient = supabase as any;

const toDateKey = (date: dayjs.Dayjs) => date.tz(IST_TIMEZONE).format('YYYY-MM-DD');
const getTodayKey = () => toDateKey(dayjs());
const getYesterdayKey = () => toDateKey(dayjs().subtract(1, 'day'));
const getLoggedStorageKey = (dateKey: string) => `streak_logged_${dateKey}`;

const buildMilestone = (days: number): StreakMilestone | undefined => {
  const config = STREAK_MILESTONES.find((item) => item.days === days);
  if (!config) return undefined;
  return {
    day: config.days,
    badgeName: config.name,
    icon: config.icon,
    badgeType: `streak_${config.days}`,
  };
};

const isUniqueConstraintError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  return code === '23505';
};

export interface LogStreakResult {
  didLog: boolean;
  streakCount: number;
  longestStreak: number;
  isLoggedToday: boolean;
  milestone?: StreakMilestone;
}

export async function isStreakLoggedToday(): Promise<boolean> {
  const key = getLoggedStorageKey(getTodayKey());
  const value = await AsyncStorage.getItem(key);
  return value === '1';
}

export async function markStreakLoggedToday(): Promise<void> {
  const key = getLoggedStorageKey(getTodayKey());
  await AsyncStorage.setItem(key, '1');
}

async function ensureMilestoneBadge(userId: string, milestone: StreakMilestone): Promise<void> {
  const { data: existingBadge, error: existingError } = await supabaseClient
    .from('badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_type', milestone.badgeType)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message || 'Failed checking milestone badge');
  }

  if (existingBadge) return;

  const { error: insertBadgeError } = await supabaseClient.from('badges').insert({
    user_id: userId,
    badge_type: milestone.badgeType,
    badge_name: milestone.badgeName,
  });

  if (insertBadgeError && !isUniqueConstraintError(insertBadgeError)) {
    throw new Error(insertBadgeError.message || 'Failed creating milestone badge');
  }
}

export async function logStreakAction(userId: string, actionType: StreakActionType): Promise<LogStreakResult> {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const storageKey = getLoggedStorageKey(todayKey);
  const hasLoggedToday = (await AsyncStorage.getItem(storageKey)) === '1';

  const { data: userRow, error: userError } = await supabaseClient
    .from('users')
    .select('streak_count, longest_streak, last_active_date')
    .eq('id', userId)
    .single();

  if (userError || !userRow) {
    throw new Error(userError?.message || 'Failed fetching user streak data');
  }

  if (hasLoggedToday) {
    return {
      didLog: false,
      streakCount: userRow.streak_count ?? 0,
      longestStreak: userRow.longest_streak ?? 0,
      isLoggedToday: true,
    };
  }

  const lastActiveDate = userRow.last_active_date;
  const previousStreak = userRow.streak_count ?? 0;
  const nextStreakCount =
    lastActiveDate === todayKey ? previousStreak : lastActiveDate === yesterdayKey ? previousStreak + 1 : 1;
  const nextLongestStreak = Math.max(userRow.longest_streak ?? 0, nextStreakCount);
  const milestone = buildMilestone(nextStreakCount);

  const { error: streakLogError } = await supabaseClient.from('streak_logs').insert({
    user_id: userId,
    action_type: actionType,
    logged_date: todayKey,
  });

  if (streakLogError && !isUniqueConstraintError(streakLogError)) {
    throw new Error(streakLogError.message || 'Failed logging streak activity');
  }

  const { error: updateError } = await supabaseClient
    .from('users')
    .update({
      streak_count: nextStreakCount,
      longest_streak: nextLongestStreak,
      last_active_date: todayKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(updateError.message || 'Failed updating user streak count');
  }

  await AsyncStorage.setItem(storageKey, '1');

  if (milestone) {
    await ensureMilestoneBadge(userId, milestone);
  }

  return {
    didLog: true,
    streakCount: nextStreakCount,
    longestStreak: nextLongestStreak,
    isLoggedToday: true,
    milestone,
  };
}

export async function fetchStreakBadges(userId: string): Promise<StreakMilestone[]> {
  const { data, error } = await supabaseClient
    .from('badges')
    .select('badge_type, badge_name')
    .eq('user_id', userId)
    .like('badge_type', 'streak_%');

  if (error) {
    throw new Error(error.message || 'Failed fetching streak badges');
  }

  return (data as Array<{ badge_type: string; badge_name: string }> | null)?.map((row) => {
    const rawDay = Number(row.badge_type.replace('streak_', ''));
    const fallback = buildMilestone(rawDay);
    return {
      day: rawDay,
      badgeName: row.badge_name || fallback?.badgeName || `${rawDay}-day streak`,
      icon: fallback?.icon || 'local-fire-department',
      badgeType: row.badge_type,
    };
  }) ?? [];
}

