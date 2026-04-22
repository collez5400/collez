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
    const now = new Date();
    const windowStart = new Date(now.getTime() + 110 * 60 * 1000); // +1h50m
    const windowEnd = new Date(now.getTime() + 130 * 60 * 1000); // +2h10m

    const { data: events, error: eventsError } = await adminClient
      .from('events')
      .select('id, title, end_time')
      .eq('status', 'live')
      .is('push_ending_soon_sent_at', null)
      .gte('end_time', windowStart.toISOString())
      .lte('end_time', windowEnd.toISOString());
    if (eventsError) throw new Error(eventsError.message || 'Failed loading ending-soon events');

    const targetEvents = events ?? [];
    if (!targetEvents.length) {
      return new Response(JSON.stringify({ success: true, targetedEvents: 0, sentOk: 0, sentErrors: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('id, push_token')
      .eq('push_enabled', true)
      .eq('push_event_enabled', true)
      .not('push_token', 'is', null);
    if (usersError) throw new Error(usersError.message || 'Failed loading users');

    const validUsers = (users ?? []).filter((u) => isValidExpoToken(u.push_token));

    let ok = 0;
    let errors = 0;
    for (const event of targetEvents) {
      const messages = validUsers.map((u) => ({
        to: u.push_token,
        sound: 'default',
        title: 'Event ending soon',
        body: event.title ? `${event.title} ends in ~2 hours. Join now.` : 'A live event ends in ~2 hours. Join now.',
        data: { url: `/events/trivia/${event.id}` },
      }));

      for (const batch of chunk(messages, 100)) {
        const result = await sendExpoPush(batch);
        ok += result.ok;
        errors += result.errors;
      }

      await adminClient
        .from('events')
        .update({ push_ending_soon_sent_at: new Date().toISOString() })
        .eq('id', event.id);
    }

    return new Response(
      JSON.stringify({ success: true, targetedEvents: targetEvents.length, targetedUsers: validUsers.length, sentOk: ok, sentErrors: errors }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed sending ending-soon pushes';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

