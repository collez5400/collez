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
    return new Response(JSON.stringify({ error: 'Unauthorized caller' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const eventId = body?.eventId?.toString?.() ?? '';
    if (!eventId) {
      return new Response(JSON.stringify({ error: 'Missing eventId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: event, error: eventError } = await adminClient
      .from('events')
      .select('id, title, status, push_live_sent_at')
      .eq('id', eventId)
      .single();
    if (eventError || !event) throw new Error(eventError?.message || 'Event not found');

    if (event.push_live_sent_at) {
      return new Response(JSON.stringify({ success: true, alreadySent: true }), {
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

    const valid = (users ?? []).filter((u) => isValidExpoToken(u.push_token));
    const messages = valid.map((u) => ({
      to: u.push_token,
      sound: 'default',
      title: 'Event is LIVE',
      body: event.title ? `${event.title} is live now. Join before it ends.` : 'A new event is live now.',
      data: { url: `/events/trivia/${eventId}` },
    }));

    let ok = 0;
    let errors = 0;
    for (const batch of chunk(messages, 100)) {
      const result = await sendExpoPush(batch);
      ok += result.ok;
      errors += result.errors;
    }

    await adminClient
      .from('events')
      .update({ push_live_sent_at: new Date().toISOString() })
      .eq('id', eventId);

    return new Response(
      JSON.stringify({ success: true, eventId, targeted: valid.length, sentOk: ok, sentErrors: errors }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed sending event live push';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

