import { create } from 'zustand';
import { supabase } from '../config/supabase';
import type {
  Event,
  EventParticipation,
  HuntClue,
  TreasureHuntConfig,
  TriviaConfig,
} from '../models/event';
import { useAuthStore } from './authStore';
import { useStreakStore } from './streakStore';

interface SubmitTriviaPayload {
  event: Event;
  score: number;
  totalQuestions: number;
}

interface SubmitTriviaAnswerPayload {
  eventId: string;
  questionId: string;
  selectedIndex: number; // -1 = timed out / unanswered
  isCorrect: boolean;
}

interface SubmitHuntResponsePayload {
  eventId: string;
  clueId: string;
  response: string;
}

interface HuntProgressData {
  currentClueIndex: number;
  solvedClueIds: string[];
  answers: Array<{ clueId: string; response: string; solved: boolean; submittedAt: string }>;
}

interface HuntSubmitResult {
  solved: boolean;
  completed: boolean;
  currentClueIndex: number;
  message: string;
}

interface EventStoreState {
  liveEvents: Event[];
  upcomingEvents: Event[];
  pastEvents: Event[];
  participationsByEventId: Record<string, EventParticipation>;
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  joinEvent: (eventId: string) => Promise<EventParticipation | null>;
  getParticipation: (eventId: string) => Promise<EventParticipation | null>;
  submitTriviaAnswer: (payload: SubmitTriviaAnswerPayload) => Promise<void>;
  submitTriviaResult: (payload: SubmitTriviaPayload) => Promise<{  xpAwarded: number; passed: boolean } | null>;
  submitHuntResponse: (payload: SubmitHuntResponsePayload) => Promise<HuntSubmitResult | null>;
  clearError: () => void;
}

function getAuthUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

function getTriviaConfig(event: Event): TriviaConfig | null {
  if (!event.config || typeof event.config !== 'object') return null;
  if (!Array.isArray((event.config as TriviaConfig).questions)) return null;
  return event.config as TriviaConfig;
}

function getTreasureHuntConfig(event: Event): TreasureHuntConfig | null {
  if (!event.config || typeof event.config !== 'object') return null;
  if (!Array.isArray((event.config as TreasureHuntConfig).clues)) return null;
  return event.config as TreasureHuntConfig;
}

function normalizeText(value: string, caseSensitive: boolean) {
  const trimmed = value.trim();
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

function evaluateClue(clue: HuntClue, response: string): boolean {
  const answer = normalizeText(response, Boolean(clue.case_sensitive));
  if (!answer) return false;

  if (clue.type === 'question') {
    if (!clue.answer) return false;
    return answer === normalizeText(clue.answer, Boolean(clue.case_sensitive));
  }

  if (clue.type === 'action' || clue.type === 'navigate') {
    const expected = clue.action ?? clue.hidden_element_id ?? clue.target_screen ?? clue.id;
    return answer === normalizeText(expected, false);
  }

  if (clue.type === 'puzzle') {
    const puzzleData = clue.puzzle_data ?? {};
    const expected = typeof puzzleData.answer === 'string' ? puzzleData.answer : '';
    if (!expected) return false;
    return answer === normalizeText(expected, Boolean(clue.case_sensitive));
  }

  return false;
}

function getHuntProgress(participation: EventParticipation): HuntProgressData {
  const baseProgress = (participation.progress ?? {}) as Record<string, unknown>;
  return {
    currentClueIndex:
      typeof baseProgress.currentClueIndex === 'number' && Number.isFinite(baseProgress.currentClueIndex)
        ? Math.max(0, baseProgress.currentClueIndex)
        : 0,
    solvedClueIds: Array.isArray(baseProgress.solvedClueIds)
      ? baseProgress.solvedClueIds.filter((value): value is string => typeof value === 'string')
      : [],
    answers: Array.isArray(baseProgress.answers)
      ? baseProgress.answers.filter(
          (value): value is HuntProgressData['answers'][number] =>
            Boolean(value) &&
            typeof value === 'object' &&
            typeof (value as { clueId?: unknown }).clueId === 'string' &&
            typeof (value as { response?: unknown }).response === 'string' &&
            typeof (value as { solved?: unknown }).solved === 'boolean' &&
            typeof (value as { submittedAt?: unknown }).submittedAt === 'string'
        )
      : [],
  };
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  liveEvents: [],
  upcomingEvents: [],
  pastEvents: [],
  participationsByEventId: {},
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('events')
        .select(
          'id, title, description, event_type, status, start_time, end_time, xp_reward, badge_name, banner_image_url, config, created_at'
        )
        .order('start_time', { ascending: true });

      if (error) throw new Error(error.message);
      const rows = (data ?? []) as Event[];

      set({
        liveEvents: rows.filter((item) => item.status === 'live'),
        upcomingEvents: rows.filter((item) => item.status === 'upcoming'),
        pastEvents: rows.filter((item) => item.status === 'ended'),
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load events',
      });
    }
  },

  joinEvent: async (eventId) => {
    const userId = getAuthUserId();
    if (!userId) return null;

    try {
      const existing = get().participationsByEventId[eventId] ?? (await get().getParticipation(eventId));
      if (existing) {
        void useStreakStore.getState().logStreakAction('trivia');
        return existing;
      }

      const { data, error } = await supabase
        .from('event_participations')
        .insert({
          event_id: eventId,
          user_id: userId,
          score: 0,
          xp_earned: 0,
          completed: false,
          progress: { answers: [], totalAnswered: 0, currentClueIndex: 0, solvedClueIds: [] },
        } as any)
        .select('id, event_id, user_id, score, xp_earned, completed, progress, started_at, completed_at')
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Failed to join event');
      const participation = data as EventParticipation;
      set((state) => ({
        participationsByEventId: { ...state.participationsByEventId, [eventId]: participation },
      }));
      void useStreakStore.getState().logStreakAction('trivia');
      return participation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join event';
      if (message.toLowerCase().includes('duplicate key value')) {
        const participation = await get().getParticipation(eventId);
        if (participation) void useStreakStore.getState().logStreakAction('trivia');
        return participation;
      }
      set({ error: message });
      return null;
    }
  },

  getParticipation: async (eventId) => {
    const userId = getAuthUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('event_participations')
      .select('id, event_id, user_id, score, xp_earned, completed, progress, started_at, completed_at')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      set({ error: error.message });
      return null;
    }
    if (!data) return null;

    const participation = data as EventParticipation;
    set((state) => ({
      participationsByEventId: { ...state.participationsByEventId, [eventId]: participation },
    }));
    return participation;
  },

  submitTriviaAnswer: async ({ eventId, questionId, selectedIndex, isCorrect }) => {
    const userId = getAuthUserId();
    if (!userId) return;
    const existing = get().participationsByEventId[eventId] ?? (await get().getParticipation(eventId));
    if (!existing) return;

    const prevProgress = (existing.progress ?? {}) as Record<string, unknown>;
    const prevAnswers = (Array.isArray(prevProgress.answers) ? prevProgress.answers : []) as unknown[];
    const answers = [
      ...prevAnswers,
      {
        questionId,
        selectedIndex,
        isCorrect,
        answeredAt: new Date().toISOString(),
      },
    ];

    const nextProgress = {
      ...prevProgress,
      answers,
      totalAnswered: answers.length,
    };

    const { data, error } = await (supabase as any)
      .from('event_participations')
      .update({ progress: nextProgress } as any)
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .select('id, event_id, user_id, score, xp_earned, completed, progress, started_at, completed_at')
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Failed to submit trivia answer' });
      return;
    }

    const participation = data as EventParticipation;
    set((state) => ({
      participationsByEventId: { ...state.participationsByEventId, [eventId]: participation },
    }));
  },

  submitTriviaResult: async ({ event, score, totalQuestions }) => {
    const userId = getAuthUserId();
    if (!userId) return null;
    const supabaseClient = supabase as any;

    const config = getTriviaConfig(event);
    const xpPerCorrect = config?.xp_per_correct ?? 5;
    const participationXp = config?.participation_xp ?? 5;
    const passingScore = config?.passing_score ?? Math.ceil(totalQuestions * 0.7);
    const passed = score >= passingScore;
    const xpAwarded = score * xpPerCorrect + participationXp;

    const { data: participationData, error: participationError } = await supabaseClient
      .from('event_participations')
      .update({
        score,
        xp_earned: xpAwarded,
        completed: true,
        completed_at: new Date().toISOString(),
        progress: { totalQuestions, answered: totalQuestions, score },
      } as any)
      .eq('event_id', event.id)
      .eq('user_id', userId)
      .select('id, event_id, user_id, score, xp_earned, completed, progress, started_at, completed_at')
      .single();

    if (participationError || !participationData) {
      set({ error: participationError?.message ?? 'Failed to submit trivia results' });
      return null;
    }

    if (passed && (config?.badge_name ?? event.badge_name)) {
      const badgeName = config?.badge_name ?? event.badge_name ?? 'Trivia Winner';
      const badgeType = `event_${event.id}`;
      await supabase.from('badges').upsert(
        {
          user_id: userId,
          badge_type: badgeType,
          badge_name: badgeName,
        } as any,
        { onConflict: 'user_id,badge_type', ignoreDuplicates: true }
      );
    }

    const participation = participationData as EventParticipation;
    set((state) => ({
      participationsByEventId: { ...state.participationsByEventId, [event.id]: participation },
    }));

    return { xpAwarded, passed };
  },

  submitHuntResponse: async ({ eventId, clueId, response }) => {
    const userId = getAuthUserId();
    if (!userId) return null;

    const event = [...get().liveEvents, ...get().upcomingEvents, ...get().pastEvents].find((item) => item.id === eventId);
    if (!event || event.event_type !== 'treasure_hunt') {
      set({ error: 'Treasure hunt event not found' });
      return null;
    }

    const config = getTreasureHuntConfig(event);
    if (!config || config.clues.length === 0) {
      set({ error: 'Treasure hunt clues are not configured' });
      return null;
    }

    const participation = get().participationsByEventId[eventId] ?? (await get().getParticipation(eventId));
    if (!participation) {
      set({ error: 'Join this event before submitting clues' });
      return null;
    }

    const current = getHuntProgress(participation);
    const clue = config.clues[current.currentClueIndex];
    if (!clue || clue.id !== clueId) {
      return {
        solved: false,
        completed: false,
        currentClueIndex: current.currentClueIndex,
        message: 'This clue is locked or already solved.',
      };
    }

    const solved = evaluateClue(clue, response);
    const now = new Date().toISOString();
    const nextSolved = solved ? [...new Set([...current.solvedClueIds, clue.id])] : current.solvedClueIds;
    const nextIndex = solved ? Math.min(current.currentClueIndex + 1, config.clues.length) : current.currentClueIndex;
    const completed = solved && nextIndex >= config.clues.length;

    const nextProgress = {
      currentClueIndex: nextIndex,
      solvedClueIds: nextSolved,
      answers: [...current.answers, { clueId, response, solved, submittedAt: now }],
    };

    const { data, error } = await (supabase as any)
      .from('event_participations')
      .update({
        progress: nextProgress,
        completed,
        completed_at: completed ? now : null,
      } as any)
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .select('id, event_id, user_id, score, xp_earned, completed, progress, started_at, completed_at')
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Failed to submit treasure hunt response' });
      return null;
    }

    const updatedParticipation = data as EventParticipation;
    set((state) => ({
      participationsByEventId: { ...state.participationsByEventId, [eventId]: updatedParticipation },
    }));

    return {
      solved,
      completed,
      currentClueIndex: nextIndex,
      message: solved
        ? completed
          ? 'Treasure hunt completed!'
          : 'Clue solved. Next clue unlocked.'
        : 'Incorrect answer. Try again.',
    };
  },

  clearError: () => set({ error: null }),
}));
