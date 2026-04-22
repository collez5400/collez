// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
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
      .select('id, event_type, start_time, end_time, config')
      .eq('id', eventId)
      .single();
    if (eventError || !event) throw new Error(eventError?.message ?? 'Event not found');
    if (event.event_type !== 'college_battle') throw new Error('Event is not a college battle');

    const minParticipants = Number(event.config?.min_participants ?? 10);

    const { data: rows, error: rowsError } = await supabaseAdmin
      .from('xp_transactions')
      .select('amount, user_id, users!inner(college_id)')
      .eq('source', 'event')
      .eq('source_id', eventId)
      .gte('created_at', event.start_time)
      .lte('created_at', event.end_time);
    if (rowsError) throw new Error(rowsError.message ?? 'Failed to load XP transactions');

    const totalsByCollege = new Map<string, { totalXp: number; participants: Set<string> }>();
    for (const row of rows ?? []) {
      const collegeId = row?.users?.college_id;
      const userId = row?.user_id;
      if (!collegeId || !userId) continue;
      const existing = totalsByCollege.get(collegeId) ?? { totalXp: 0, participants: new Set<string>() };
      existing.totalXp += Number(row.amount ?? 0);
      existing.participants.add(userId);
      totalsByCollege.set(collegeId, existing);
    }

    const collegeIds = Array.from(totalsByCollege.keys());
    if (collegeIds.length === 0) {
      return new Response(JSON.stringify({ standings: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: colleges, error: collegesError } = await supabaseAdmin
      .from('colleges')
      .select('id, name, city, state, student_count')
      .in('id', collegeIds);
    if (collegesError) throw new Error(collegesError.message ?? 'Failed to load colleges');

    const standings = (colleges ?? [])
      .map((college) => {
        const aggregate = totalsByCollege.get(college.id);
        const participantCount = aggregate?.participants.size ?? 0;
        const totalXpEarned = aggregate?.totalXp ?? 0;
        const studentCount = Math.max(1, Number(college.student_count ?? 0));
        const score = totalXpEarned / studentCount;
        return {
          college_id: college.id,
          college_name: college.name,
          college_city: college.city ?? null,
          college_state: college.state ?? null,
          participant_count: participantCount,
          student_count: Number(college.student_count ?? 0),
          total_xp_earned: totalXpEarned,
          score,
          eligible: participantCount >= minParticipants,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return new Response(JSON.stringify({ standings }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch battle standings' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
