// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

function ensureAuthorized(req: Request) {
  const secret = req.headers.get('x-cron-secret');
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    throw new Error('Unauthorized finalize call');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    ensureAuthorized(req);
    const body = await req.json();
    const eventId = String(body?.eventId ?? '').trim();
    if (!eventId) {
      return new Response(JSON.stringify({ error: 'eventId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, event_type, status, start_time, end_time, config')
      .eq('id', eventId)
      .single();
    if (eventError || !event) throw new Error(eventError?.message ?? 'Event not found');
    if (event.event_type !== 'college_battle') throw new Error('Event is not a college battle');
    if (event.config?.rewards_distributed_at) {
      return new Response(
        JSON.stringify({
          distributed: false,
          reason: 'rewards_already_distributed',
          distributedAt: event.config.rewards_distributed_at,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: standingsResponse, error: standingsError } = await supabaseAdmin.functions.invoke(
      'get-college-battle-standings',
      { body: { eventId } }
    );
    if (standingsError) throw new Error(standingsError.message ?? 'Failed to compute battle standings');
    const standings = Array.isArray(standingsResponse?.standings) ? standingsResponse.standings : [];

    const prizes = Array.isArray(event.config?.prizes)
      ? event.config.prizes
          .map((item) => ({
            rank: Number(item.rank),
            xp_bonus: Number(item.xp_bonus),
            badge_name: item.badge_name ? String(item.badge_name) : null,
          }))
          .filter((item) => item.rank > 0 && item.xp_bonus > 0)
      : [];

    const eligibleWinners = standings.filter((row) => row.eligible).slice(0, prizes.length);
    let rewardedUsers = 0;

    for (const winner of eligibleWinners) {
      const prize = prizes.find((item) => item.rank === winner.rank);
      if (!prize) continue;

      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, xp')
        .eq('college_id', winner.college_id)
        .eq('is_banned', false)
        .eq('is_graduated', false);
      if (usersError) throw new Error(usersError.message ?? 'Failed to load winner college users');

      for (const user of users ?? []) {
        const xpAmount = prize.xp_bonus;
        const { error: transactionError } = await supabaseAdmin.from('xp_transactions').insert({
          user_id: user.id,
          amount: xpAmount,
          source: 'event',
          source_id: eventId,
          description: `College battle reward — rank #${winner.rank} (${event.title})`,
        });
        if (transactionError) throw new Error(transactionError.message ?? 'Failed inserting battle reward transaction');

        const { error: userUpdateError } = await supabaseAdmin
          .from('users')
          .update({
            xp: Number(user.xp ?? 0) + xpAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        if (userUpdateError) throw new Error(userUpdateError.message ?? 'Failed updating winner user XP');

        if (prize.badge_name) {
          await supabaseAdmin.from('badges').upsert(
            {
              user_id: user.id,
              badge_type: `college_battle_${eventId}_rank_${winner.rank}`,
              badge_name: prize.badge_name,
            },
            { onConflict: 'user_id,badge_type', ignoreDuplicates: true }
          );
        }

        rewardedUsers += 1;
      }
    }

    await supabaseAdmin
      .from('events')
      .update({
        status: 'ended',
        config: {
          ...(event.config ?? {}),
          rewards_distributed_at: new Date().toISOString(),
          rewards_distributed_user_count: rewardedUsers,
        },
      })
      .eq('id', eventId);

    return new Response(
      JSON.stringify({
        distributed: true,
        rewardedUsers,
        winnerCount: eligibleWinners.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to finalize college battle' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
