import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { awardXp, fetchXpState } from '../services/xpService';
import { AwardXpPayload, AwardXpResult } from '../models/xp';
import { getRankProgress, getRankTier, RankTier, xpToNextRank } from '../utils/rankCalculator';
import { CACHE_DURATIONS } from '../config/constants';
import { getCachedValue, markFetched, setCachedValue, shouldFetchByTimestamp } from '../services/appCacheService';

interface XpState {
  totalXp: number;
  dailyXpEarned: number;
  rankTier: RankTier;
  xpNeededToNextRank: number;
  rankProgress: number;
  lastAwardedXp: number;
  isLoading: boolean;
  error: string | null;
  fetchXpData: (options?: { forceRefresh?: boolean }) => Promise<void>;
  awardXpForAction: (payload: AwardXpPayload) => Promise<AwardXpResult | null>;
}

const deriveComputed = (totalXp: number) => {
  const tier = getRankTier(totalXp);
  return {
    rankTier: tier,
    xpNeededToNextRank: xpToNextRank(totalXp),
    rankProgress: getRankProgress(totalXp),
  };
};

export const useXpStore = create<XpState>((set) => ({
  totalXp: 0,
  dailyXpEarned: 0,
  rankTier: 'fresher',
  xpNeededToNextRank: 100,
  rankProgress: 0,
  lastAwardedXp: 0,
  isLoading: false,
  error: null,

  fetchXpData: async (options) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;
    const forceRefresh = options?.forceRefresh ?? false;

    const cacheKey = `xp:${userId}`;
    const shouldFetch = await shouldFetchByTimestamp(`xp_${userId}`, CACHE_DURATIONS.SHORT, forceRefresh);
    if (!shouldFetch) {
      const cached = await getCachedValue<{ totalXp: number; dailyXpEarned: number }>(cacheKey);
      if (cached) {
        const computed = deriveComputed(cached.totalXp);
        set({
          totalXp: cached.totalXp,
          dailyXpEarned: cached.dailyXpEarned,
          ...computed,
          error: null,
        });
        return;
      }
    }

    set({ isLoading: true, error: null });
    try {
      const state = await fetchXpState(userId);
      const computed = deriveComputed(state.totalXp);
      await setCachedValue(cacheKey, state, CACHE_DURATIONS.SHORT);
      await markFetched(`xp_${userId}`);
      set({
        totalXp: state.totalXp,
        dailyXpEarned: state.dailyXpEarned,
        ...computed,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const cached = await getCachedValue<{ totalXp: number; dailyXpEarned: number }>(cacheKey);
      if (cached) {
        const computed = deriveComputed(cached.totalXp);
        set({
          totalXp: cached.totalXp,
          dailyXpEarned: cached.dailyXpEarned,
          ...computed,
          isLoading: false,
          error: null,
        });
        return;
      }
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch XP data',
      });
    }
  },

  awardXpForAction: async (payload) => {
    const authStore = useAuthStore.getState();
    const userId = authStore.user?.id;
    if (!userId) return null;

    try {
      const result = await awardXp(userId, payload);
      const computed = deriveComputed(result.totalXp);
      await setCachedValue(
        `xp:${userId}`,
        { totalXp: result.totalXp, dailyXpEarned: result.dailyXpEarned },
        CACHE_DURATIONS.SHORT
      );
      await markFetched(`xp_${userId}`);
      set({
        totalXp: result.totalXp,
        dailyXpEarned: result.dailyXpEarned,
        ...computed,
        lastAwardedXp: result.awardedXp,
        error: null,
      });

      if (authStore.user) {
        useAuthStore.setState({
          user: {
            ...authStore.user,
            xp: result.totalXp,
            daily_xp_earned: result.dailyXpEarned,
          } as typeof authStore.user,
        });
      }

      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to award XP',
      });
      return null;
    }
  },
}));
