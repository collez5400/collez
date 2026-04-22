// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CRON_SECRET) {
  throw new Error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or CRON_SECRET');
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

function addDays(yyyyMmDd: string, days: number): string {
  // yyyy-mm-dd to date in IST by constructing in +05:30
  const dt = new Date(`${yyyyMmDd}T00:00:00+05:30`);
  dt.setDate(dt.getDate() + days);
  return getIstDateString(dt);
}

function isValidExpoToken(token?: string | null): boolean {
  if (!token) return false;
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

async function sendExpoPush(messages: any[]): Promise<{ ok: number; errors: number }> {
  if (!messages.length) return { ok: 0, errors: 0 };
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  const json = await res.json().catch(() => null);
  const data = json?.data ?? [];
  const ok = Array.isArray(data) ? data.filter((x) => x?.status === 'ok').length : 0;
  const errors = Array.isArray(data) ? data.filter((x) => x?.status !== 'ok').length : messages.length - ok;
  return { ok, errors };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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

  const providedSecret = req.headers.get('x-cron-secret');
  if (!providedSecret || providedSecret !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized cron caller' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const todayIst = getIstDateString();
    const twoDaysAgoIst = addDays(todayIst, -2);
    const sevenDaysAgoIst = addDays(todayIst, -7);

    const { data: users2d, error: users2dError } = await adminClient
      .from('users')
      .select('id, push_token, push_enabled, push_streak_enabled')
      .eq('push_enabled', true)
      .eq('push_streak_enabled', true)
      .eq('last_active_date', twoDaysAgoIst)
      .not('push_token', 'is', null);

    if (users2dError) throw new Error(users2dError.message || 'Failed loading 2-day inactive users');

    const { data: users7d, error: users7dError } = await adminClient
      .from('users')
      .select('id, push_token, push_enabled, push_streak_enabled')
      .eq('push_enabled', true)
      .eq('push_streak_enabled', true)
      .eq('last_active_date', sevenDaysAgoIst)
      .not('push_token', 'is', null);

    if (users7dError) throw new Error(users7dError.message || 'Failed loading 7-day inactive users');

    const valid2d = (users2d ?? []).filter((u) => isValidExpoToken(u.push_token));
    const valid7d = (users7d ?? []).filter((u) => isValidExpoToken(u.push_token));

    // Optional: compute rank drops from snapshots if available
    const userIds7d = valid7d.map((u) => u.id);
    let rankDropByUserId = new Map<string, number>();
    if (userIds7d.length) {
      const [snapPast, snapToday] = await Promise.all([
        adminClient
          .from('user_rank_snapshots')
          .select('user_id, national_rank')
          .eq('snapshot_date', sevenDaysAgoIst)
          .in('user_id', userIds7d),
        adminClient
          .from('user_rank_snapshots')
          .select('user_id, national_rank')
          .eq('snapshot_date', todayIst)
          .in('user_id', userIds7d),
      ]);
      const pastById = new Map((snapPast.data ?? []).map((r) => [r.user_id, r.national_rank]));
      const todayById = new Map((snapToday.data ?? []).map((r) => [r.user_id, r.national_rank]));
      for (const id of userIds7d) {
        const pastRank = pastById.get(id);
        const nowRank = todayById.get(id);
        if (typeof pastRank === 'number' && typeof nowRank === 'number' && nowRank > pastRank) {
          rankDropByUserId.set(id, nowRank - pastRank);
        }
      }
    }

    const messages: any[] = [
      ...valid2d.map((u) => ({
        to: u.push_token,
        sound: 'default',
        title: 'Your streak is at risk',
        body: 'Open COLLEZ today to keep the fire alive.',
        data: { url: '/(tabs)/home' },
      })),
      ...valid7d.map((u) => {
        const dropped = rankDropByUserId.get(u.id);
        return {
          to: u.push_token,
          sound: 'default',
          title: dropped ? `You dropped ${dropped} rank(s)` : 'You’ve slipped in the rankings',
          body: 'Come back and climb — a quick session today makes a difference.',
          data: { url: '/(tabs)/rankings' },
        };
      }),
    ];

    let ok = 0;
    let errors = 0;
    for (const batch of chunk(messages, 100)) {
      const result = await sendExpoPush(batch);
      ok += result.ok;
      errors += result.errors;
    }

    return new Response(
      JSON.stringify({
        success: true,
        todayIst,
        twoDaysAgoIst,
        sevenDaysAgoIst,
        targeted2d: valid2d.length,
        targeted7d: valid7d.length,
        sentOk: ok,
        sentErrors: errors,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed sending streak reminders';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

