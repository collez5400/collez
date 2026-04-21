import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { useAuthStore } from './authStore';
import {
  fetchStreakBadges,
  isStreakLoggedToday,
  logStreakAction,
  LogStreakResult,
} from '../services/streakService';
import { StreakActionType, StreakMilestone } from '../models/streak';
import { CACHE_DURATIONS } from '../config/constants';
import { getCachedValue, markFetched, setCachedValue, shouldFetchByTimestamp } from '../services/appCacheService';

interface StreakState {
  streakCount: number;
  longestStreak: number;
  isLoggedToday: boolean;
  badges: StreakMilestone[];
  lastMilestone: StreakMilestone | null;
  isLoading: boolean;
  error: string | null;
  logStreakAction: (actionType: StreakActionType) => Promise<LogStreakResult | null>;
  fetchStreakData: (options?: { forceRefresh?: boolean }) => Promise<void>;
  clearLastMilestone: () => void;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streakCount: 0,
  longestStreak: 0,
  isLoggedToday: false,
  badges: [],
  lastMilestone: null,
  isLoading: false,
  error: null,

  fetchStreakData: async (options) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const forceRefresh = options?.forceRefresh ?? false;

    const cacheKey = `streak:${userId}`;
    const shouldFetch = await shouldFetchByTimestamp(`streak_${userId}`, CACHE_DURATIONS.SHORT, forceRefresh);
    if (!shouldFetch) {
      const cached = await getCachedValue<{
        streakCount: number;
        longestStreak: number;
        isLoggedToday: boolean;
        badges: StreakMilestone[];
      }>(cacheKey);
      if (cached) {
        set({
          streakCount: cached.streakCount,
          longestStreak: cached.longestStreak,
          isLoggedToday: cached.isLoggedToday,
          badges: cached.badges,
          error: null,
        });
        return;
      }
    }

    set({ isLoading: true, error: null });
    try {
      const supabaseClient = supabase as any;
      const loggedToday = await isStreakLoggedToday();
      const { data: userRow, error: userError } = await supabaseClient
        .from('users')
        .select('streak_count, longest_streak')
        .eq('id', userId)
        .single();

      if (userError || !userRow) {
        throw new Error(userError?.message || 'Failed to fetch streak state');
      }

      const badges = await fetchStreakBadges(userId);
      const nextCache = {
        streakCount: userRow.streak_count ?? 0,
        longestStreak: userRow.longest_streak ?? 0,
        isLoggedToday: loggedToday,
        badges,
      };
      await setCachedValue(cacheKey, nextCache, CACHE_DURATIONS.SHORT);
      await markFetched(`streak_${userId}`);
      set({
        ...nextCache,
        isLoading: false,
      });
    } catch (error) {
      const cached = await getCachedValue<{
        streakCount: number;
        longestStreak: number;
        isLoggedToday: boolean;
        badges: StreakMilestone[];
      }>(cacheKey);
      if (cached) {
        set({
          ...cached,
          isLoading: false,
          error: null,
        });
        return;
      }
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch streak data',
        isLoading: false,
      });
    }
  },

  logStreakAction: async (actionType) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return null;

    try {
      const result = await logStreakAction(userId, actionType);
      const nextCache = {
        streakCount: result.streakCount,
        longestStreak: result.longestStreak,
        isLoggedToday: result.isLoggedToday,
        badges: result.milestone
          ? (() => {
              const existing = get().badges;
              const has = existing.some((badge) => badge.badgeType === result.milestone?.badgeType);
              return has ? existing : [...existing, result.milestone];
            })()
          : get().badges,
      };
      await setCachedValue(`streak:${userId}`, nextCache, CACHE_DURATIONS.SHORT);
      await markFetched(`streak_${userId}`);
      set({
        streakCount: result.streakCount,
        longestStreak: result.longestStreak,
        isLoggedToday: result.isLoggedToday,
        lastMilestone: result.milestone ?? get().lastMilestone,
        error: null,
      });

      if (result.milestone) {
        set((state) => {
          const alreadyExists = state.badges.some((badge) => badge.badgeType === result.milestone?.badgeType);
          return {
            badges: alreadyExists ? state.badges : [...state.badges, result.milestone!],
          };
        });
      }

      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to log streak action',
      });
      return null;
    }
  },

  clearLastMilestone: () => set({ lastMilestone: null }),
}));

