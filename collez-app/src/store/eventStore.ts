import { create } from 'zustand';
import { supabase } from '../config/supabase';
import type { Event, EventParticipation, TriviaConfig } from '../models/event';
import { useAuthStore } from './authStore';

interface SubmitTriviaPayload {
  event: Event;
  score: number;
  totalQuestions: number;
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
  submitTriviaResult: (payload: SubmitTriviaPayload) => Promise<{  xpAwarded: number; passed: boolean } | null>;
  clearError: () => void;
}

function getAuthUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

function getTriviaConfig(event: Event): TriviaConfig | null {
  if (!event.config || typeof event.config !== 'object') return null;
  return event.config as TriviaConfig;
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
      const rows = ((data ?? []) as Event[]).filter((item) => item.event_type === 'trivia');

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
      if (existing) return existing;

      const { data, error } = await supabase
        .from('event_participations')
        .insert({
          event_id: eventId,
          user_id: userId,
          score: 0,
          xp_earned: 0,
          completed: false,
          progress: { answers: [], totalAnswered: 0 },
        } as any)
        .select('id, event_id, user_id, score, xp_earned, completed, progress, started_at, completed_at')
        .single();

      if (error || !data) throw new Error(error?.message ?? 'Failed to join event');
      const participation = data as EventParticipation;
      set((state) => ({
        participationsByEventId: { ...state.participationsByEventId, [eventId]: participation },
      }));
      return participation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join event';
      if (message.toLowerCase().includes('duplicate key value')) {
        return get().getParticipation(eventId);
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

  clearError: () => set({ error: null }),
}));
