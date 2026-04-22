// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IST_TIMEZONE = 'Asia/Kolkata';

function getIstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addDays(yyyyMmDd: string, days: number): string {
  const dt = new Date(`${yyyyMmDd}T00:00:00+05:30`);
  dt.setDate(dt.getDate() + days);
  return getIstDateString(dt);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { authorization: authHeader } },
    });
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: authError?.message ?? 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const actionType = String(body?.actionType ?? '').trim();
    if (!actionType) {
      return new Response(JSON.stringify({ error: 'Missing actionType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const todayKey = getIstDateString();
    const yesterdayKey = addDays(todayKey, -1);
    const twoDaysAgoKey = addDays(todayKey, -2);

    const { data: userRow, error: userError } = await adminClient
      .from('users')
      .select('streak_count, longest_streak, last_active_date, streak_shields, streak_shield_active')
      .eq('id', user.id)
      .single();
    if (userError || !userRow) throw new Error(userError?.message || 'Failed fetching user row');

    if (userRow.last_active_date === todayKey) {
      return new Response(
        JSON.stringify({
          didLog: false,
          streakCount: userRow.streak_count ?? 0,
          longestStreak: userRow.longest_streak ?? 0,
          isLoggedToday: true,
          shields: userRow.streak_shields ?? 0,
          shieldActive: Boolean(userRow.streak_shield_active),
          shieldUsed: false,
          shieldEarned: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let nextStreakCount = 1;
    let shieldUsed = false;
    let shieldEarned = false;
    let nextShields = Number(userRow.streak_shields ?? 0);
    let nextShieldActive = Boolean(userRow.streak_shield_active);
    const previousStreak = Number(userRow.streak_count ?? 0);
    const lastActiveDate = userRow.last_active_date;

    if (lastActiveDate === yesterdayKey) {
      nextStreakCount = previousStreak + 1;
    } else if (
      lastActiveDate === twoDaysAgoKey &&
      nextShieldActive &&
      nextShields > 0 &&
      previousStreak >= 30
    ) {
      nextStreakCount = previousStreak + 1;
      nextShields -= 1;
      nextShieldActive = false;
      shieldUsed = true;
    } else {
      nextStreakCount = 1;
      nextShieldActive = false;
    }

    if (nextStreakCount === 30) {
      nextShields += 1;
      shieldEarned = true;
    }

    const nextLongestStreak = Math.max(Number(userRow.longest_streak ?? 0), nextStreakCount);

    const { error: streakLogError } = await adminClient.from('streak_logs').insert({
      user_id: user.id,
      action_type: actionType,
      logged_date: todayKey,
    });
    if (streakLogError && streakLogError.code !== '23505') {
      throw new Error(streakLogError.message || 'Failed logging streak');
    }

    const { error: updateError } = await adminClient
      .from('users')
      .update({
        streak_count: nextStreakCount,
        longest_streak: nextLongestStreak,
        last_active_date: todayKey,
        streak_shields: nextShields,
        streak_shield_active: nextShieldActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (updateError) throw new Error(updateError.message || 'Failed updating streak');

    return new Response(
      JSON.stringify({
        didLog: true,
        streakCount: nextStreakCount,
        longestStreak: nextLongestStreak,
        isLoggedToday: true,
        shields: nextShields,
        shieldActive: nextShieldActive,
        shieldUsed,
        shieldEarned,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to log streak action';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
