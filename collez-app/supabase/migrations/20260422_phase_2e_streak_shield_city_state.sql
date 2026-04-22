-- Phase 2E: streak shield + city/state leaderboards

begin;

create extension if not exists pg_cron;

alter table public.users
  add column if not exists streak_shields integer not null default 0,
  add column if not exists streak_shield_active boolean not null default false;

create index if not exists idx_users_streak_shields on public.users(streak_shields);
create index if not exists idx_users_shield_active on public.users(streak_shield_active);

drop materialized view if exists public.mv_city_leaderboard;
create materialized view public.mv_city_leaderboard as
select
  u.id,
  u.full_name,
  u.username,
  u.avatar_url,
  u.xp,
  u.streak_count,
  u.rank_tier,
  u.is_coordinator,
  u.college_id,
  c.name as college_name,
  c.city as city_name,
  row_number() over (partition by c.city order by u.xp desc) as city_rank
from public.users u
join public.colleges c on u.college_id = c.id
where u.is_banned = false
  and u.is_graduated = false
  and c.is_approved = true;

create unique index if not exists idx_mv_city_lb_id on public.mv_city_leaderboard(id);
create index if not exists idx_mv_city_lb_city on public.mv_city_leaderboard(city_name);

drop materialized view if exists public.mv_state_leaderboard;
create materialized view public.mv_state_leaderboard as
select
  u.id,
  u.full_name,
  u.username,
  u.avatar_url,
  u.xp,
  u.streak_count,
  u.rank_tier,
  u.is_coordinator,
  u.college_id,
  c.name as college_name,
  c.state as state_name,
  row_number() over (partition by c.state order by u.xp desc) as state_rank
from public.users u
join public.colleges c on u.college_id = c.id
where u.is_banned = false
  and u.is_graduated = false
  and c.is_approved = true;

create unique index if not exists idx_mv_state_lb_id on public.mv_state_leaderboard(id);
create index if not exists idx_mv_state_lb_state on public.mv_state_leaderboard(state_name);

create or replace function public.refresh_leaderboard_views()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently public.mv_college_leaderboard;
  refresh materialized view concurrently public.mv_weekly_leaderboard;
  refresh materialized view concurrently public.mv_city_leaderboard;
  refresh materialized view concurrently public.mv_state_leaderboard;
end;
$$;

commit;
