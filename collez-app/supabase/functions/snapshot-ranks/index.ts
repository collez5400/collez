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

    const { data, error } = await adminClient
      .from('mv_college_leaderboard')
      .select('id, national_rank, college_rank');

    if (error) throw new Error(error.message || 'Failed fetching leaderboard ranks');

    const rows = (data ?? []).map((r) => ({
      user_id: r.id,
      snapshot_date: todayIst,
      national_rank: r.national_rank ?? null,
      college_rank: r.college_rank ?? null,
    }));

    let inserted = 0;
    for (const batch of chunk(rows, 500)) {
      const { error: upsertError } = await adminClient
        .from('user_rank_snapshots')
        .upsert(batch, { onConflict: 'user_id,snapshot_date' });
      if (upsertError) throw new Error(upsertError.message || 'Failed upserting rank snapshots');
      inserted += batch.length;
    }

    return new Response(JSON.stringify({ success: true, snapshotDate: todayIst, rowsUpserted: inserted }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed snapshotting ranks';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

