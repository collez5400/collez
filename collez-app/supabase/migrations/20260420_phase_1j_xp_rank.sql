-- Phase 1J support SQL for leaderboard refresh and cron jobs.
-- Apply in Supabase SQL editor or migration runner.

create extension if not exists pg_cron;

create or replace function public.refresh_leaderboard_views()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently public.mv_college_leaderboard;
  refresh materialized view concurrently public.mv_weekly_leaderboard;
end;
$$;

-- Reset daily XP at midnight IST (18:30 UTC previous day)
select
  cron.schedule(
    'reset-daily-xp-ist',
    '30 18 * * *',
    $$
      update public.users
      set daily_xp_earned = 0,
          last_xp_reset_date = (now() at time zone 'Asia/Kolkata')::date,
          updated_at = now()
      where daily_xp_earned > 0;
    $$
  );

-- Refresh materialized leaderboard views every 15 minutes
select
  cron.schedule(
    'refresh-leaderboard-15-min',
    '*/15 * * * *',
    $$ select public.refresh_leaderboard_views(); $$
  );
