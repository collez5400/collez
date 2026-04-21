-- Phase 1K.5 — Leaderboard seed data (dev only)
-- Run this in Supabase SQL Editor (service role / admin).
-- It creates:
-- - 2 colleges (approved)
-- - 30 users split across colleges with different XP/streaks
-- - weekly xp_transactions in the current week
-- - refreshes materialized views used by the app

begin;

-- Ensure required extension for gen_random_uuid() exists (usually already enabled on Supabase)
create extension if not exists pgcrypto;

-- 1) Colleges
insert into public.colleges (id, name, city, state, is_approved, is_disabled, total_xp, student_count, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', 'COLLEZ Institute of Technology', 'Bengaluru', 'Karnataka', true, false, 0, 0, now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'COLLEZ National University', 'Pune', 'Maharashtra', true, false, 0, 0, now(), now())
on conflict (id) do update
set
  name = excluded.name,
  city = excluded.city,
  state = excluded.state,
  is_approved = excluded.is_approved,
  is_disabled = excluded.is_disabled,
  updated_at = now();

-- 1.5) Reset previous dev seed rows so script is re-runnable without duplicates
delete from public.xp_transactions
where user_id in (
  select id from public.users where email like 'dev_user_%@collez.dev'
);

-- 2) Users
-- NOTE: In production, users are created via Supabase Auth.
-- For dev/testing, inserting directly into public.users is fine when executed as admin/service.
with seed as (
  select
    gs as n,
    case when gs <= 18 then '11111111-1111-1111-1111-111111111111'::uuid else '22222222-2222-2222-2222-222222222222'::uuid end as college_id,
    (50 + (gs * 37) % 6000)::int as xp,
    (1 + (gs * 3) % 120)::int as streak_count
  from generate_series(1, 30) gs
),
upserted as (
  insert into public.users (
    id,
    google_id,
    email,
    full_name,
    username,
    avatar_url,
    college_id,
    xp,
    streak_count,
    last_active_date,
    longest_streak,
    rank_tier,
    is_coordinator,
    coordinator_type,
    coordinator_region,
    is_banned,
    is_graduated,
    featured,
    daily_xp_earned,
    last_xp_reset_date,
    created_at,
    updated_at
  )
  select
    ('00000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid as id,
    ('google_dev_' || n::text) as google_id,
    ('dev_user_' || n::text || '@collez.dev') as email,
    ('Dev User ' || n::text) as full_name,
    ('devuser' || n::text) as username,
    null as avatar_url,
    seed.college_id,
    seed.xp,
    seed.streak_count,
    current_date as last_active_date,
    seed.streak_count as longest_streak,
    case
      when seed.xp >= 150000 then 'national_icon'
      when seed.xp >= 60000 then 'state_hero'
      when seed.xp >= 25000 then 'campus_legend'
      when seed.xp >= 10000 then 'titan'
      when seed.xp >= 4000 then 'elite'
      when seed.xp >= 1500 then 'strategist'
      when seed.xp >= 500 then 'scholar'
      when seed.xp >= 100 then 'grinder'
      else 'fresher'
    end as rank_tier,
    false as is_coordinator,
    null as coordinator_type,
    null as coordinator_region,
    false as is_banned,
    false as is_graduated,
    false as featured,
    0 as daily_xp_earned,
    current_date as last_xp_reset_date,
    now() - interval '10 days' as created_at,
    now() as updated_at
  from seed
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    username = excluded.username,
    email = excluded.email,
    college_id = excluded.college_id,
    xp = excluded.xp,
    streak_count = excluded.streak_count,
    last_active_date = excluded.last_active_date,
    longest_streak = excluded.longest_streak,
    is_banned = false,
    is_graduated = false,
    updated_at = now()
  returning id, college_id, xp
)
select count(*) as users_upserted from upserted;

-- 3) Weekly XP transactions (for mv_weekly_leaderboard)
-- Create 2 transactions per user within the current week.
insert into public.xp_transactions (id, user_id, amount, source, source_id, description, created_at)
select
  gen_random_uuid(),
  u.id,
  (5 + (extract(epoch from now())::int + (row_number() over (order by u.id))::int) % 40) as amount,
  'event' as source,
  null as source_id,
  'Dev seed weekly transaction' as description,
  now() - interval '2 days' as created_at
from public.users u
where u.email like 'dev_user_%@collez.dev';

insert into public.xp_transactions (id, user_id, amount, source, source_id, description, created_at)
select
  gen_random_uuid(),
  u.id,
  (5 + (extract(epoch from now())::int + (row_number() over (order by u.id))::int) % 35) as amount,
  'daily_login' as source,
  null as source_id,
  'Dev seed weekly transaction' as description,
  now() - interval '1 day' as created_at
from public.users u
where u.email like 'dev_user_%@collez.dev';

-- 4) Recalculate college aggregates (optional but keeps totals coherent)
update public.colleges c
set
  student_count = sub.student_count,
  total_xp = sub.total_xp,
  updated_at = now()
from (
  select
    college_id,
    count(*)::int as student_count,
    coalesce(sum(xp), 0)::bigint as total_xp
  from public.users
  where is_banned = false and is_graduated = false and college_id is not null
  group by college_id
) sub
where c.id = sub.college_id;

-- 5) Refresh materialized views used by Phase 1K UI
refresh materialized view concurrently public.mv_college_leaderboard;
refresh materialized view concurrently public.mv_weekly_leaderboard;

commit;

