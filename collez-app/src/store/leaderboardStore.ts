import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { CACHE_DURATIONS } from '../config/constants';
import { supabase } from '../config/supabase';
import { useAuthStore } from './authStore';

const LEADERBOARD_PAGE_SIZE = 20;
const LEADERBOARD_CACHE_KEY = 'leaderboard_cache_v1';
const LEADERBOARD_CACHE_TTL_MS = CACHE_DURATIONS.MEDIUM;

export type LeaderboardType = 'college' | 'national' | 'weekly';

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  college_name: string | null;
  xp: number;
  weekly_xp: number | null;
  streak_count: number;
  rank_tier: string | null;
  college_rank: number | null;
  national_rank: number | null;
  position: number;
}

export interface UserRankSummary {
  type: LeaderboardType;
  rank: number | null;
  xp: number;
  weeklyXp?: number | null;
  collegeName: string | null;
}

interface LeaderboardCachePayload {
  updatedAt: number;
  collegeBoard: LeaderboardEntry[];
  nationalBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  userCollegeRank: number | null;
}

interface LeaderboardState {
  collegeBoard: LeaderboardEntry[];
  nationalBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  userCollegeRank: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMoreCollege: boolean;
  hasMoreNational: boolean;
  hasMoreWeekly: boolean;
  fetchCollegeBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  fetchNationalBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  fetchWeeklyBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  refreshAllBoards: () => Promise<void>;
  getUserRankSummary: (type: LeaderboardType) => UserRankSummary | null;
}

const mapCollegeOrNationalRow = (
  row: Record<string, any>,
  type: 'college' | 'national',
  fallbackPosition: number
): LeaderboardEntry => ({
  id: String(row.id),
  full_name: row.full_name ?? 'Unknown',
  username: row.username ?? 'unknown',
  avatar_url: row.avatar_url ?? null,
  college_name: row.college_name ?? null,
  xp: Number(row.xp ?? 0),
  weekly_xp: null,
  streak_count: Number(row.streak_count ?? 0),
  rank_tier: row.rank_tier ?? null,
  college_rank: row.college_rank != null ? Number(row.college_rank) : null,
  national_rank: row.national_rank != null ? Number(row.national_rank) : null,
  position:
    type === 'college'
      ? Number(row.college_rank ?? fallbackPosition)
      : Number(row.national_rank ?? fallbackPosition),
});

const mapWeeklyRow = (row: Record<string, any>, fallbackPosition: number): LeaderboardEntry => ({
  id: String(row.id),
  full_name: row.full_name ?? 'Unknown',
  username: row.username ?? 'unknown',
  avatar_url: row.avatar_url ?? null,
  college_name: row.college_name ?? null,
  xp: Number(row.weekly_xp ?? 0),
  weekly_xp: Number(row.weekly_xp ?? 0),
  streak_count: Number(row.streak_count ?? 0),
  rank_tier: row.rank_tier ?? null,
  college_rank: null,
  national_rank: null,
  position: fallbackPosition,
});

const shouldUseCache = (updatedAt: number): boolean => Date.now() - updatedAt < LEADERBOARD_CACHE_TTL_MS;
const readCachePayload = async (): Promise<LeaderboardCachePayload | null> => {
  const cached = await AsyncStorage.getItem(LEADERBOARD_CACHE_KEY);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as LeaderboardCachePayload;
  } catch {
    return null;
  }
};

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  collegeBoard: [],
  nationalBoard: [],
  weeklyBoard: [],
  userCollegeRank: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasMoreCollege: true,
  hasMoreNational: true,
  hasMoreWeekly: true,

  fetchCollegeBoard: async (opts) => {
    const refresh = opts?.refresh ?? false;
    const current = get();
    const authUser = useAuthStore.getState().user;
    if (!authUser?.college_id) return;

    const currentLength = refresh ? 0 : current.collegeBoard.length;
    if (!refresh && !current.hasMoreCollege) return;

    if (!refresh && currentLength === 0) {
      const parsed = await readCachePayload();
      if (parsed && shouldUseCache(parsed.updatedAt) && parsed.collegeBoard.length > 0) {
        set({
          collegeBoard: parsed.collegeBoard,
          nationalBoard: parsed.nationalBoard,
          weeklyBoard: parsed.weeklyBoard,
          userCollegeRank: parsed.userCollegeRank,
          hasMoreCollege: parsed.collegeBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreNational: parsed.nationalBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreWeekly: parsed.weeklyBoard.length >= LEADERBOARD_PAGE_SIZE,
          error: null,
        });
        return;
      }
    }

    set({
      isLoading: !refresh && currentLength === 0,
      isRefreshing: refresh,
      error: null,
    });

    try {
      const supabaseClient = supabase as any;
      const from = currentLength;
      const to = from + LEADERBOARD_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('mv_college_leaderboard')
        .select(
          'id, full_name, username, avatar_url, xp, streak_count, rank_tier, college_name, college_rank, national_rank, college_id'
        )
        .eq('college_id', authUser.college_id)
        .order('college_rank', { ascending: true })
        .range(from, to);

      if (error) {
        throw new Error(error.message || 'Failed fetching college leaderboard');
      }

      const incoming = (data ?? []).map((row: Record<string, any>, index: number) =>
        mapCollegeOrNationalRow(row, 'college', from + index + 1)
      );
      const merged = refresh ? incoming : [...current.collegeBoard, ...incoming];
      const userRow = merged.find((entry: LeaderboardEntry) => entry.id === authUser.id);

      set({
        collegeBoard: merged,
        userCollegeRank: userRow?.position ?? current.userCollegeRank,
        hasMoreCollege: incoming.length === LEADERBOARD_PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });

      const nextState = get();
      const payload: LeaderboardCachePayload = {
        updatedAt: Date.now(),
        collegeBoard: nextState.collegeBoard,
        nationalBoard: nextState.nationalBoard,
        weeklyBoard: nextState.weeklyBoard,
        userCollegeRank: nextState.userCollegeRank,
      };
      await AsyncStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      const parsed = await readCachePayload();
      if (parsed?.collegeBoard?.length) {
        set({
          collegeBoard: parsed.collegeBoard,
          nationalBoard: parsed.nationalBoard,
          weeklyBoard: parsed.weeklyBoard,
          userCollegeRank: parsed.userCollegeRank,
          hasMoreCollege: parsed.collegeBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreNational: parsed.nationalBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreWeekly: parsed.weeklyBoard.length >= LEADERBOARD_PAGE_SIZE,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });
        return;
      }
      set({
        error: error instanceof Error ? error.message : 'Failed fetching college leaderboard',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  fetchNationalBoard: async (opts) => {
    const refresh = opts?.refresh ?? false;
    const current = get();
    const currentLength = refresh ? 0 : current.nationalBoard.length;
    if (!refresh && !current.hasMoreNational) return;

    set({
      isLoading: !refresh && currentLength === 0,
      isRefreshing: refresh,
      error: null,
    });

    try {
      const supabaseClient = supabase as any;
      const from = currentLength;
      const to = from + LEADERBOARD_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('mv_college_leaderboard')
        .select('id, full_name, username, avatar_url, xp, streak_count, rank_tier, college_name, college_rank, national_rank')
        .order('national_rank', { ascending: true })
        .range(from, to);

      if (error) {
        throw new Error(error.message || 'Failed fetching national leaderboard');
      }

      const incoming = (data ?? []).map((row: Record<string, any>, index: number) =>
        mapCollegeOrNationalRow(row, 'national', from + index + 1)
      );
      const merged = refresh ? incoming : [...current.nationalBoard, ...incoming];

      set({
        nationalBoard: merged,
        hasMoreNational: incoming.length === LEADERBOARD_PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      const parsed = await readCachePayload();
      if (parsed?.nationalBoard?.length) {
        set({
          nationalBoard: parsed.nationalBoard,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });
        return;
      }
      set({
        error: error instanceof Error ? error.message : 'Failed fetching national leaderboard',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  fetchWeeklyBoard: async (opts) => {
    const refresh = opts?.refresh ?? false;
    const current = get();
    const currentLength = refresh ? 0 : current.weeklyBoard.length;
    if (!refresh && !current.hasMoreWeekly) return;

    set({
      isLoading: !refresh && currentLength === 0,
      isRefreshing: refresh,
      error: null,
    });

    try {
      const supabaseClient = supabase as any;
      const from = currentLength;
      const to = from + LEADERBOARD_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('mv_weekly_leaderboard')
        .select('id, full_name, username, avatar_url, weekly_xp, college_name')
        .order('weekly_xp', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(error.message || 'Failed fetching weekly leaderboard');
      }

      const incoming = (data ?? []).map((row: Record<string, any>, index: number) =>
        mapWeeklyRow(row, from + index + 1)
      );
      const merged = refresh ? incoming : [...current.weeklyBoard, ...incoming];

      set({
        weeklyBoard: merged,
        hasMoreWeekly: incoming.length === LEADERBOARD_PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      const parsed = await readCachePayload();
      if (parsed?.weeklyBoard?.length) {
        set({
          weeklyBoard: parsed.weeklyBoard,
          isLoading: false,
          isRefreshing: false,
          error: null,
        });
        return;
      }
      set({
        error: error instanceof Error ? error.message : 'Failed fetching weekly leaderboard',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  refreshAllBoards: async () => {
    await Promise.all([
      get().fetchCollegeBoard({ refresh: true }),
      get().fetchNationalBoard({ refresh: true }),
      get().fetchWeeklyBoard({ refresh: true }),
    ]);
  },

  getUserRankSummary: (type) => {
    const authUser = useAuthStore.getState().user;
    if (!authUser) return null;

    if (type === 'college') {
      const entry = get().collegeBoard.find((item) => item.id === authUser.id);
      return {
        type,
        rank: entry?.position ?? get().userCollegeRank,
        xp: authUser.xp ?? entry?.xp ?? 0,
        collegeName: entry?.college_name ?? null,
      };
    }

    if (type === 'national') {
      const entry = get().nationalBoard.find((item) => item.id === authUser.id);
      return {
        type,
        rank: entry?.position ?? null,
        xp: authUser.xp ?? entry?.xp ?? 0,
        collegeName: entry?.college_name ?? null,
      };
    }

    const weeklyEntry = get().weeklyBoard.find((item) => item.id === authUser.id);
    return {
      type,
      rank: weeklyEntry?.position ?? null,
      xp: weeklyEntry?.xp ?? 0,
      weeklyXp: weeklyEntry?.weekly_xp ?? 0,
      collegeName: weeklyEntry?.college_name ?? null,
    };
  },
}));
