-- Phase 4A.6: Friend challenge system

CREATE TABLE IF NOT EXISTS public.friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_xp INTEGER NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  creator_start_xp INTEGER NOT NULL DEFAULT 0,
  opponent_start_xp INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending | active | completed | rejected
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reward_xp INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friend_challenges_participants
  ON public.friend_challenges(creator_id, opponent_id, status, created_at DESC);

ALTER TABLE public.friend_challenges ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'friend_challenges'
      AND policyname = 'Participants can read their friend challenges'
  ) THEN
    CREATE POLICY "Participants can read their friend challenges"
      ON public.friend_challenges
      FOR SELECT
      USING (auth.uid() = creator_id OR auth.uid() = opponent_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'friend_challenges'
      AND policyname = 'Users can create their challenge invites'
  ) THEN
    CREATE POLICY "Users can create their challenge invites"
      ON public.friend_challenges
      FOR INSERT
      WITH CHECK (auth.uid() = creator_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.accept_friend_challenge(p_challenge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge public.friend_challenges%ROWTYPE;
BEGIN
  SELECT * INTO v_challenge FROM public.friend_challenges WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found';
  END IF;
  IF v_challenge.opponent_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only invited opponent can accept';
  END IF;
  IF v_challenge.status <> 'pending' THEN
    RAISE EXCEPTION 'Challenge is not pending';
  END IF;

  UPDATE public.friend_challenges
  SET status = 'active',
      starts_at = NOW(),
      ends_at = NOW() + make_interval(days => GREATEST(v_challenge.duration_days, 1))
  WHERE id = p_challenge_id;

  RETURN jsonb_build_object('ok', true, 'status', 'active');
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_friend_challenge(p_challenge_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge public.friend_challenges%ROWTYPE;
  v_creator_xp INTEGER;
  v_opponent_xp INTEGER;
  v_creator_delta INTEGER;
  v_opponent_delta INTEGER;
  v_winner UUID;
BEGIN
  SELECT * INTO v_challenge FROM public.friend_challenges WHERE id = p_challenge_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Challenge not found';
  END IF;
  IF auth.uid() <> v_challenge.creator_id AND auth.uid() <> v_challenge.opponent_id THEN
    RAISE EXCEPTION 'Only participants can finalize';
  END IF;
  IF v_challenge.status <> 'active' THEN
    RAISE EXCEPTION 'Challenge is not active';
  END IF;

  SELECT xp INTO v_creator_xp FROM public.users WHERE id = v_challenge.creator_id;
  SELECT xp INTO v_opponent_xp FROM public.users WHERE id = v_challenge.opponent_id;

  v_creator_delta := GREATEST(v_creator_xp - v_challenge.creator_start_xp, 0);
  v_opponent_delta := GREATEST(v_opponent_xp - v_challenge.opponent_start_xp, 0);

  IF v_creator_delta >= v_challenge.target_xp OR v_opponent_delta >= v_challenge.target_xp OR NOW() >= v_challenge.ends_at THEN
    IF v_creator_delta = v_opponent_delta THEN
      v_winner := NULL;
    ELSIF v_creator_delta > v_opponent_delta THEN
      v_winner := v_challenge.creator_id;
    ELSE
      v_winner := v_challenge.opponent_id;
    END IF;

    UPDATE public.friend_challenges
    SET status = 'completed',
        winner_id = v_winner,
        completed_at = NOW()
    WHERE id = p_challenge_id;

    IF v_winner IS NOT NULL THEN
      UPDATE public.users
      SET xp = xp + v_challenge.reward_xp, updated_at = NOW()
      WHERE id = v_winner;

      INSERT INTO public.xp_transactions (user_id, amount, source, description)
      VALUES (v_winner, v_challenge.reward_xp, 'bonus', 'Friend challenge winner reward');
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'status', 'completed',
      'winner_id', v_winner,
      'creator_delta', v_creator_delta,
      'opponent_delta', v_opponent_delta
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'status', 'active',
    'creator_delta', v_creator_delta,
    'opponent_delta', v_opponent_delta
  );
END;
$$;

REVOKE ALL ON FUNCTION public.accept_friend_challenge(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_friend_challenge(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_friend_challenge(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_friend_challenge(UUID) TO authenticated;
