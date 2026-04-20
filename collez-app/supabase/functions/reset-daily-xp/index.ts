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
    const { error } = await adminClient
      .from('users')
      .update({
        daily_xp_earned: 0,
        last_xp_reset_date: todayIst,
        updated_at: new Date().toISOString(),
      })
      .gt('daily_xp_earned', 0);

    if (error) throw new Error(error.message || 'Failed to reset daily XP');

    return new Response(JSON.stringify({ success: true, resetDate: todayIst }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reset daily XP';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
