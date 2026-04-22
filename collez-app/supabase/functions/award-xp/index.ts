// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ANON_KEY');
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DAILY_CAP = 100;
const HOURLY_FLAG_THRESHOLD = 80;
const FIVE_MIN_BLOCK_THRESHOLD = 50;
const XP_SOURCES = new Set(['daily_login', 'trivia', 'treasure_hunt', 'puzzle_rush', 'event', 'weekly_streak', 'bonus']);
const RANK_THRESHOLDS = [
  { minXp: 150000, tier: 'national_icon' },
  { minXp: 60000, tier: 'state_hero' },
  { minXp: 25000, tier: 'campus_legend' },
  { minXp: 10000, tier: 'titan' },
  { minXp: 4000, tier: 'elite' },
  { minXp: 1500, tier: 'strategist' },
  { minXp: 500, tier: 'scholar' },
  { minXp: 100, tier: 'grinder' },
  { minXp: 0, tier: 'fresher' },
] as const;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getIstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getRankTier(xp: number): string {
  const matchedThreshold = RANK_THRESHOLDS.find((threshold) => xp >= threshold.minXp);
  return matchedThreshold ? matchedThreshold.tier : 'fresher';
}

type AwardXpRequest = {
  userId: string;
  amount: number;
  source: string;
  sourceId?: string;
  description?: string;
  bypassDailyCap?: boolean;
};

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
    let body: AwardXpRequest;
    try {
      body = (await req.json()) as AwardXpRequest;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing bearer token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!body.userId || !body.source || typeof body.amount !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (body.amount <= 0) {
      return new Response(JSON.stringify({ error: 'XP amount must be positive' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!XP_SOURCES.has(body.source)) {
      return new Response(JSON.stringify({ error: 'Invalid XP source' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requesterId = authData.user.id;
    if (requesterId !== body.userId) {
      return new Response(JSON.stringify({ error: 'Forbidden userId' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: user, error: userError } = await adminClient
      .from('users')
      .select('id, xp, daily_xp_earned, last_xp_reset_date, college_id')
      .eq('id', body.userId)
      .single();

    if (userError || !user) {
      throw new Error(userError?.message || 'User not found');
    }

    const todayIst = getIstDateString();
    const lastResetDate = user.last_xp_reset_date ?? '';
    const currentDaily = lastResetDate === todayIst ? user.daily_xp_earned ?? 0 : 0;
    const bypassDailyCap = body.bypassDailyCap === true || body.source === 'bonus';

    const now = new Date();
    const fiveMinAgoIso = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const oneHourAgoIso = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const { data: velocityRows, error: velocityError } = await adminClient
      .from('xp_transactions')
      .select('amount, created_at')
      .eq('user_id', body.userId)
      .gte('created_at', oneHourAgoIso);
    if (velocityError) {
      throw new Error(velocityError.message || 'Failed to validate XP velocity');
    }
    const hourXp = (velocityRows ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const fiveMinXp = (velocityRows ?? [])
      .filter((row: { created_at?: string }) => typeof row.created_at === 'string' && row.created_at >= fiveMinAgoIso)
      .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

    if (!bypassDailyCap && fiveMinXp + body.amount > FIVE_MIN_BLOCK_THRESHOLD) {
      return new Response(
        JSON.stringify({
          error: 'XP temporarily blocked due to unusually high activity. Please try again shortly.',
          code: 'ANTI_CHEAT_BLOCK_5MIN',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!bypassDailyCap && hourXp + body.amount > HOURLY_FLAG_THRESHOLD) {
      await adminClient.from('anti_cheat_flags').insert({
        user_id: body.userId,
        flag_type: 'xp_velocity_hour',
        severity: 'medium',
        reason: `XP velocity exceeded ${HOURLY_FLAG_THRESHOLD}/hour`,
        metadata: {
          projected_hour_xp: hourXp + body.amount,
          threshold: HOURLY_FLAG_THRESHOLD,
          source: body.source,
        },
      });
    }
    const awardedXp = bypassDailyCap ? body.amount : Math.min(body.amount, Math.max(0, DAILY_CAP - currentDaily));
    const capped = !bypassDailyCap && awardedXp < body.amount;

    if (body.source === 'daily_login') {
      const startOfDayIst = `${todayIst}T00:00:00+05:30`;
      const endOfDayIst = `${todayIst}T23:59:59+05:30`;
      const { data: existingDailyLogin, error: existingDailyLoginError } = await adminClient
        .from('xp_transactions')
        .select('id')
        .eq('user_id', body.userId)
        .eq('source', 'daily_login')
        .gte('created_at', startOfDayIst)
        .lte('created_at', endOfDayIst)
        .limit(1);

      if (existingDailyLoginError) {
        throw new Error(existingDailyLoginError.message || 'Failed to validate daily login XP');
      }
      if ((existingDailyLogin ?? []).length > 0) {
        return new Response(
          JSON.stringify({
            error: 'Daily login XP already awarded today',
            awardedXp: 0,
            totalXp: user.xp ?? 0,
            dailyXpEarned: currentDaily,
            dailyCap: DAILY_CAP,
            capped: true,
            rankTier: getRankTier(user.xp ?? 0),
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
    }

    if (awardedXp <= 0) {
      return new Response(
        JSON.stringify({
          awardedXp: 0,
          totalXp: user.xp ?? 0,
          dailyXpEarned: currentDaily,
          dailyCap: DAILY_CAP,
          capped: true,
          rankTier: getRankTier(user.xp ?? 0),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { error: transactionError } = await adminClient.from('xp_transactions').insert({
      user_id: body.userId,
      amount: awardedXp,
      source: body.source,
      source_id: body.sourceId ?? null,
      description: body.description ?? null,
    });
    if (transactionError) {
      throw new Error(transactionError.message || 'Failed to insert xp transaction');
    }

    const totalXp = (user.xp ?? 0) + awardedXp;
    const dailyXpEarned = bypassDailyCap ? currentDaily : currentDaily + awardedXp;
    const rankTier = getRankTier(totalXp);
    const { error: userUpdateError } = await adminClient
      .from('users')
      .update({
        xp: totalXp,
        daily_xp_earned: dailyXpEarned,
        last_xp_reset_date: todayIst,
        rank_tier: rankTier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.userId);
    if (userUpdateError) {
      throw new Error(userUpdateError.message || 'Failed to update user xp');
    }

    if (user.college_id) {
      const { data: college, error: collegeError } = await adminClient
        .from('colleges')
        .select('total_xp')
        .eq('id', user.college_id)
        .single();
      if (collegeError) {
        throw new Error(collegeError.message || 'Failed to fetch college XP');
      }

      const { error: collegeUpdateError } = await adminClient
        .from('colleges')
        .update({ total_xp: (college.total_xp ?? 0) + awardedXp, updated_at: new Date().toISOString() })
        .eq('id', user.college_id);
      if (collegeUpdateError) {
        throw new Error(collegeUpdateError.message || 'Failed to update college XP');
      }
    }

    return new Response(
      JSON.stringify({
        awardedXp,
        totalXp,
        dailyXpEarned,
        dailyCap: DAILY_CAP,
        capped,
        rankTier,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error while awarding XP';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
