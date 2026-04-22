import { supabase } from '../config/supabase';
import { XP_VALUES } from '../config/constants';

export async function applyReferralCode(userId: string, code: string) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return { ok: true as const };

  const { data, error } = await (supabase as any).rpc('apply_referral_code', {
    p_new_user_id: userId,
    p_invite_code: normalizedCode,
    p_bonus_xp: XP_VALUES.REFERRAL_BONUS,
  });

  if (error) {
    throw new Error(error.message || 'Failed to apply referral code');
  }

  return data;
}
