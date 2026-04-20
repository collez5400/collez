-- Phase 0 — Supabase base schema (required before seeding)
-- Run this first in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- Core tables
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  is_approved boolean not null default false,
  is_disabled boolean not null default false,
  total_xp bigint not null default 0,
  student_count integer not null default 0,
  requested_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_colleges_state on public.colleges(state);
create index if not exists idx_colleges_city on public.colleges(city);
create index if not exists idx_colleges_approved on public.colleges(is_approved);
create index if not exists idx_colleges_total_xp on public.colleges(total_xp desc);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  google_id text unique,
  email text unique,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  college_id uuid references public.colleges(id),
  xp integer not null default 0,
  streak_count integer not null default 0,
  last_active_date date,
  longest_streak integer not null default 0,
  rank_tier text not null default 'fresher',
  is_coordinator boolean not null default false,
  coordinator_type text,
  coordinator_region text,
  is_banned boolean not null default false,
  is_graduated boolean not null default false,
  featured boolean not null default false,
  daily_xp_earned integer not null default 0,
  last_xp_reset_date date,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_college on public.users(college_id);
create index if not exists idx_users_xp on public.users(xp desc);
create index if not exists idx_users_streak on public.users(streak_count desc);
create index if not exists idx_users_username on public.users(username);

create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  amount integer not null,
  source text not null,
  source_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_xp_trans_user on public.xp_transactions(user_id);
create index if not exists idx_xp_trans_date on public.xp_transactions(created_at);
create index if not exists idx_xp_trans_source on public.xp_transactions(source);

create table if not exists public.streak_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  action_type text not null,
  logged_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique(user_id, logged_date)
);

create index if not exists idx_streak_user_date on public.streak_logs(user_id, logged_date);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  badge_type text not null,
  badge_name text not null,
  earned_at timestamptz not null default now()
);

create index if not exists idx_badges_user on public.badges(user_id);

-- Leaderboard materialized views
drop materialized view if exists public.mv_college_leaderboard;
create materialized view public.mv_college_leaderboard as
select
  u.id,
  u.full_name,
  u.username,
  u.avatar_url,
  u.xp,
  u.streak_count,
  u.rank_tier,
  u.college_id,
  c.name as college_name,
  row_number() over (partition by u.college_id order by u.xp desc) as college_rank,
  row_number() over (order by u.xp desc) as national_rank
from public.users u
join public.colleges c on u.college_id = c.id
where u.is_banned = false
  and u.is_graduated = false
  and c.is_approved = true
  and c.is_disabled = false;

create unique index if not exists idx_mv_college_lb on public.mv_college_leaderboard(id);
create index if not exists idx_mv_college_lb_college on public.mv_college_leaderboard(college_id, college_rank);
create index if not exists idx_mv_college_lb_national on public.mv_college_leaderboard(national_rank);

drop materialized view if exists public.mv_weekly_leaderboard;
create materialized view public.mv_weekly_leaderboard as
select
  u.id,
  u.full_name,
  u.username,
  u.avatar_url,
  u.college_id,
  c.name as college_name,
  coalesce(sum(xt.amount), 0) as weekly_xp
from public.users u
join public.colleges c on u.college_id = c.id
left join public.xp_transactions xt
  on xt.user_id = u.id
 and xt.created_at >= date_trunc('week', now())
where u.is_banned = false
  and u.is_graduated = false
  and c.is_approved = true
  and c.is_disabled = false
group by u.id, u.full_name, u.username, u.avatar_url, u.college_id, c.name
order by weekly_xp desc;

create unique index if not exists idx_mv_weekly_lb on public.mv_weekly_leaderboard(id);
create index if not exists idx_mv_weekly_lb_weeklyxp on public.mv_weekly_leaderboard(weekly_xp desc);

commit;

