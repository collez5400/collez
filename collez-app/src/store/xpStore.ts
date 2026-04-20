import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { awardXp, fetchXpState } from '../services/xpService';
import { AwardXpPayload, AwardXpResult } from '../models/xp';
import { getRankProgress, getRankTier, RankTier, xpToNextRank } from '../utils/rankCalculator';

interface XpState {
  totalXp: number;
  dailyXpEarned: number;
  rankTier: RankTier;
  xpNeededToNextRank: number;
  rankProgress: number;
  lastAwardedXp: number;
  isLoading: boolean;
  error: string | null;
  fetchXpData: () => Promise<void>;
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

  fetchXpData: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const state = await fetchXpState(userId);
      const computed = deriveComputed(state.totalXp);
      set({
        totalXp: state.totalXp,
        dailyXpEarned: state.dailyXpEarned,
        ...computed,
        isLoading: false,
        error: null,
      });
    } catch (error) {
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
