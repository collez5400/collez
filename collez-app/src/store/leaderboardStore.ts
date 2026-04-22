import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { CACHE_DURATIONS } from '../config/constants';
import { supabase } from '../config/supabase';
import { useAuthStore } from './authStore';

const LEADERBOARD_PAGE_SIZE = 20;
const LEADERBOARD_CACHE_KEY = 'leaderboard_cache_v1';
const LEADERBOARD_CACHE_TTL_MS = CACHE_DURATIONS.MEDIUM;

export type LeaderboardType = 'college' | 'city' | 'state' | 'national' | 'weekly';

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
  is_coordinator?: boolean | null;
  college_rank: number | null;
  city_rank?: number | null;
  state_rank?: number | null;
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
  cityBoard: LeaderboardEntry[];
  stateBoard: LeaderboardEntry[];
  nationalBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  userCollegeRank: number | null;
}

interface LeaderboardState {
  collegeBoard: LeaderboardEntry[];
  cityBoard: LeaderboardEntry[];
  stateBoard: LeaderboardEntry[];
  nationalBoard: LeaderboardEntry[];
  weeklyBoard: LeaderboardEntry[];
  userCollegeRank: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMoreCollege: boolean;
  hasMoreCity: boolean;
  hasMoreState: boolean;
  hasMoreNational: boolean;
  hasMoreWeekly: boolean;
  fetchCollegeBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  fetchCityBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  fetchStateBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  fetchNationalBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  fetchWeeklyBoard: (opts?: { refresh?: boolean }) => Promise<void>;
  refreshAllBoards: () => Promise<void>;
  getUserRankSummary: (type: LeaderboardType) => UserRankSummary | null;
}

const mapCollegeOrNationalRow = (
  row: Record<string, any>,
  type: 'college' | 'city' | 'state' | 'national',
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
  is_coordinator: row.is_coordinator ?? null,
  college_rank: row.college_rank != null ? Number(row.college_rank) : null,
  city_rank: row.city_rank != null ? Number(row.city_rank) : null,
  state_rank: row.state_rank != null ? Number(row.state_rank) : null,
  national_rank: row.national_rank != null ? Number(row.national_rank) : null,
  position: Number(
    type === 'college'
      ? row.college_rank ?? fallbackPosition
      : type === 'city'
        ? row.city_rank ?? fallbackPosition
        : type === 'state'
          ? row.state_rank ?? fallbackPosition
          : row.national_rank ?? fallbackPosition
  ),
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
  is_coordinator: row.is_coordinator ?? null,
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
  cityBoard: [],
  stateBoard: [],
  nationalBoard: [],
  weeklyBoard: [],
  userCollegeRank: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasMoreCollege: true,
  hasMoreCity: true,
  hasMoreState: true,
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
        const cachedCityBoard = parsed.cityBoard ?? [];
        const cachedStateBoard = parsed.stateBoard ?? [];
        set({
          collegeBoard: parsed.collegeBoard,
          cityBoard: cachedCityBoard,
          stateBoard: cachedStateBoard,
          nationalBoard: parsed.nationalBoard,
          weeklyBoard: parsed.weeklyBoard,
          userCollegeRank: parsed.userCollegeRank,
          hasMoreCollege: parsed.collegeBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreCity: cachedCityBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreState: cachedStateBoard.length >= LEADERBOARD_PAGE_SIZE,
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
          'id, full_name, username, avatar_url, xp, streak_count, rank_tier, is_coordinator, college_name, college_rank, national_rank, college_id'
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
        cityBoard: nextState.cityBoard,
        stateBoard: nextState.stateBoard,
        nationalBoard: nextState.nationalBoard,
        weeklyBoard: nextState.weeklyBoard,
        userCollegeRank: nextState.userCollegeRank,
      };
      await AsyncStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
      const parsed = await readCachePayload();
      if (parsed?.collegeBoard?.length) {
        const cachedCityBoard = parsed.cityBoard ?? [];
        const cachedStateBoard = parsed.stateBoard ?? [];
        set({
          collegeBoard: parsed.collegeBoard,
          cityBoard: cachedCityBoard,
          stateBoard: cachedStateBoard,
          nationalBoard: parsed.nationalBoard,
          weeklyBoard: parsed.weeklyBoard,
          userCollegeRank: parsed.userCollegeRank,
          hasMoreCollege: parsed.collegeBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreCity: cachedCityBoard.length >= LEADERBOARD_PAGE_SIZE,
          hasMoreState: cachedStateBoard.length >= LEADERBOARD_PAGE_SIZE,
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

  fetchCityBoard: async (opts) => {
    const refresh = opts?.refresh ?? false;
    const current = get();
    const authUser = useAuthStore.getState().user;
    if (!authUser?.college_id) return;
    const currentLength = refresh ? 0 : current.cityBoard.length;
    if (!refresh && !current.hasMoreCity) return;

    set({
      isLoading: !refresh && currentLength === 0,
      isRefreshing: refresh,
      error: null,
    });

    try {
      const supabaseClient = supabase as any;
      const { data: userCollege, error: collegeError } = await supabaseClient
        .from('colleges')
        .select('city')
        .eq('id', authUser.college_id)
        .single();
      if (collegeError || !userCollege?.city) {
        throw new Error(collegeError?.message || 'Failed loading city context');
      }
      const from = currentLength;
      const to = from + LEADERBOARD_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('mv_city_leaderboard')
        .select('id, full_name, username, avatar_url, xp, streak_count, rank_tier, is_coordinator, college_name, city_name, city_rank')
        .eq('city_name', userCollege.city)
        .order('city_rank', { ascending: true })
        .range(from, to);
      if (error) throw new Error(error.message || 'Failed fetching city leaderboard');

      const incoming = (data ?? []).map((row: Record<string, any>, index: number) =>
        mapCollegeOrNationalRow(row, 'city', from + index + 1)
      );
      const merged = refresh ? incoming : [...current.cityBoard, ...incoming];
      set({
        cityBoard: merged,
        hasMoreCity: incoming.length === LEADERBOARD_PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed fetching city leaderboard',
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  fetchStateBoard: async (opts) => {
    const refresh = opts?.refresh ?? false;
    const current = get();
    const authUser = useAuthStore.getState().user;
    if (!authUser?.college_id) return;
    const currentLength = refresh ? 0 : current.stateBoard.length;
    if (!refresh && !current.hasMoreState) return;

    set({
      isLoading: !refresh && currentLength === 0,
      isRefreshing: refresh,
      error: null,
    });

    try {
      const supabaseClient = supabase as any;
      const { data: userCollege, error: collegeError } = await supabaseClient
        .from('colleges')
        .select('state')
        .eq('id', authUser.college_id)
        .single();
      if (collegeError || !userCollege?.state) {
        throw new Error(collegeError?.message || 'Failed loading state context');
      }
      const from = currentLength;
      const to = from + LEADERBOARD_PAGE_SIZE - 1;
      const { data, error } = await supabaseClient
        .from('mv_state_leaderboard')
        .select('id, full_name, username, avatar_url, xp, streak_count, rank_tier, is_coordinator, college_name, state_name, state_rank')
        .eq('state_name', userCollege.state)
        .order('state_rank', { ascending: true })
        .range(from, to);
      if (error) throw new Error(error.message || 'Failed fetching state leaderboard');

      const incoming = (data ?? []).map((row: Record<string, any>, index: number) =>
        mapCollegeOrNationalRow(row, 'state', from + index + 1)
      );
      const merged = refresh ? incoming : [...current.stateBoard, ...incoming];
      set({
        stateBoard: merged,
        hasMoreState: incoming.length === LEADERBOARD_PAGE_SIZE,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed fetching state leaderboard',
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
        .select('id, full_name, username, avatar_url, xp, streak_count, rank_tier, is_coordinator, college_name, college_rank, national_rank')
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
      get().fetchCityBoard({ refresh: true }),
      get().fetchStateBoard({ refresh: true }),
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

    if (type === 'city') {
      const entry = get().cityBoard.find((item) => item.id === authUser.id);
      return {
        type,
        rank: entry?.position ?? null,
        xp: authUser.xp ?? entry?.xp ?? 0,
        collegeName: entry?.college_name ?? null,
      };
    }

    if (type === 'state') {
      const entry = get().stateBoard.find((item) => item.id === authUser.id);
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
