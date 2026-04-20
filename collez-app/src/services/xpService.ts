import { supabase } from '../config/supabase';
import { AwardXpPayload, AwardXpResult } from '../models/xp';
import { getRankTier } from '../utils/rankCalculator';

const DAILY_CAP = 100;

interface AwardXpFunctionResponse {
  awardedXp: number;
  totalXp: number;
  dailyXpEarned: number;
  dailyCap: number;
  capped: boolean;
}

export async function awardXp(userId: string, payload: AwardXpPayload): Promise<AwardXpResult> {
  const { data, error } = await supabase.functions.invoke<AwardXpFunctionResponse>('award-xp', {
    body: {
      userId,
      source: payload.source,
      amount: payload.amount,
      sourceId: payload.sourceId,
      description: payload.description,
      bypassDailyCap: payload.bypassDailyCap ?? false,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to award XP');
  }

  if (!data) {
    throw new Error('No XP response received from server');
  }

  return {
    awardedXp: data.awardedXp,
    totalXp: data.totalXp,
    dailyXpEarned: data.dailyXpEarned,
    dailyCap: data.dailyCap ?? DAILY_CAP,
    capped: data.capped,
    rankTier: getRankTier(data.totalXp),
  };
}

export async function fetchXpState(userId: string): Promise<{
  totalXp: number;
  dailyXpEarned: number;
}> {
  const supabaseClient = supabase as any;
  const { data, error } = await supabaseClient
    .from('users')
    .select('xp, daily_xp_earned')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed fetching XP state');
  }

  return {
    totalXp: data.xp ?? 0,
    dailyXpEarned: data.daily_xp_earned ?? 0,
  };
}
