-- Phase 4A.4: Referral system

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL,
  bonus_xp INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_inviter ON public.referrals(inviter_id, created_at DESC);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'referrals'
      AND policyname = 'Users read their own referrals'
  ) THEN
    CREATE POLICY "Users read their own referrals"
      ON public.referrals
      FOR SELECT
      USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.apply_referral_code(
  p_new_user_id UUID,
  p_invite_code TEXT,
  p_bonus_xp INTEGER DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inviter_id UUID;
  v_already_referred UUID;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_new_user_id THEN
    RAISE EXCEPTION 'Not authorized to apply referral code for this user';
  END IF;

  IF p_invite_code IS NULL OR length(trim(p_invite_code)) = 0 THEN
    RAISE EXCEPTION 'Referral code is required';
  END IF;

  SELECT referred_by INTO v_already_referred
  FROM public.users
  WHERE id = p_new_user_id;

  IF v_already_referred IS NOT NULL THEN
    RAISE EXCEPTION 'Referral already applied';
  END IF;

  SELECT id INTO v_inviter_id
  FROM public.users
  WHERE invite_code = upper(trim(p_invite_code))
  LIMIT 1;

  IF v_inviter_id IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  IF v_inviter_id = p_new_user_id THEN
    RAISE EXCEPTION 'You cannot use your own referral code';
  END IF;

  INSERT INTO public.referrals (inviter_id, invitee_id, invite_code, bonus_xp)
  VALUES (v_inviter_id, p_new_user_id, upper(trim(p_invite_code)), p_bonus_xp);

  UPDATE public.users
  SET referred_by = v_inviter_id, updated_at = NOW()
  WHERE id = p_new_user_id;

  UPDATE public.users
  SET xp = xp + p_bonus_xp, updated_at = NOW()
  WHERE id IN (v_inviter_id, p_new_user_id);

  INSERT INTO public.xp_transactions (user_id, amount, source, description)
  VALUES
    (v_inviter_id, p_bonus_xp, 'bonus', 'Referral bonus - inviter'),
    (p_new_user_id, p_bonus_xp, 'bonus', 'Referral bonus - invitee');

  RETURN jsonb_build_object(
    'ok', true,
    'inviter_id', v_inviter_id,
    'invitee_id', p_new_user_id,
    'bonus_xp', p_bonus_xp
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_referral_code(UUID, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_referral_code(UUID, TEXT, INTEGER) TO authenticated;
