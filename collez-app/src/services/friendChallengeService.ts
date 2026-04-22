import { supabase } from '../config/supabase';

export type FriendChallenge = {
  id: string;
  creator_id: string;
  opponent_id: string;
  target_xp: number;
  duration_days: number;
  creator_start_xp: number;
  opponent_start_xp: number;
  winner_id: string | null;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  starts_at: string | null;
  ends_at: string | null;
  completed_at: string | null;
  reward_xp: number;
  created_at: string;
};

export async function createFriendChallenge(input: {
  creatorId: string;
  opponentId: string;
  targetXp: number;
  durationDays: number;
  creatorStartXp: number;
  opponentStartXp: number;
  rewardXp: number;
}) {
  const { data, error } = await supabase
    .from('friend_challenges')
    // @ts-expect-error Supabase manual typings
    .insert({
      creator_id: input.creatorId,
      opponent_id: input.opponentId,
      target_xp: input.targetXp,
      duration_days: input.durationDays,
      creator_start_xp: input.creatorStartXp,
      opponent_start_xp: input.opponentStartXp,
      reward_xp: input.rewardXp,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create challenge');
  return data as FriendChallenge;
}

export async function fetchLatestFriendChallenge(userA: string, userB: string) {
  const { data, error } = await supabase
    .from('friend_challenges')
    .select('*')
    .or(`and(creator_id.eq.${userA},opponent_id.eq.${userB}),and(creator_id.eq.${userB},opponent_id.eq.${userA})`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as FriendChallenge | null;
}

export async function acceptFriendChallenge(challengeId: string) {
  const { data, error } = await (supabase as any).rpc('accept_friend_challenge', {
    p_challenge_id: challengeId,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function finalizeFriendChallenge(challengeId: string) {
  const { data, error } = await (supabase as any).rpc('finalize_friend_challenge', {
    p_challenge_id: challengeId,
  });
  if (error) throw new Error(error.message);
  return data;
}
