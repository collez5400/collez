-- Phase 3D: advanced features (streak marathon/coordinator roles/anti-cheat/growth tools)

begin;

create extension if not exists pg_cron;

alter table public.users
  add column if not exists marketing_consent boolean not null default false;

create table if not exists public.anti_cheat_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  flag_type text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','reviewed','actioned')),
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_anti_cheat_flags_user on public.anti_cheat_flags(user_id);
create index if not exists idx_anti_cheat_flags_status on public.anti_cheat_flags(status, created_at desc);
create index if not exists idx_anti_cheat_flags_type on public.anti_cheat_flags(flag_type, created_at desc);

alter table public.anti_cheat_flags enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'anti_cheat_flags'
      and policyname = 'Users read own anti cheat flags'
  ) then
    execute $pol$
      create policy "Users read own anti cheat flags"
      on public.anti_cheat_flags
      for select
      using (auth.uid() = user_id);
    $pol$;
  end if;
end $$;

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
  u.is_coordinator,
  u.coordinator_type,
  u.coordinator_region,
  u.college_id,
  c.name as college_name,
  row_number() over (partition by u.college_id order by u.xp desc) as college_rank,
  row_number() over (order by u.xp desc) as national_rank
from public.users u
join public.colleges c on u.college_id = c.id
where coalesce(u.is_banned, false) = false
  and coalesce(u.is_graduated, false) = false
  and coalesce(c.is_approved, false) = true;

create unique index if not exists idx_mv_college_lb on public.mv_college_leaderboard(id);

drop materialized view if exists public.mv_weekly_leaderboard;
create materialized view public.mv_weekly_leaderboard as
select
  u.id,
  u.full_name,
  u.username,
  u.avatar_url,
  u.college_id,
  u.is_coordinator,
  u.coordinator_type,
  u.coordinator_region,
  c.name as college_name,
  coalesce(sum(xt.amount), 0) as weekly_xp
from public.users u
join public.colleges c on u.college_id = c.id
left join public.xp_transactions xt on u.id = xt.user_id
  and xt.created_at >= date_trunc('week', now())
where coalesce(u.is_banned, false) = false
group by u.id, u.full_name, u.username, u.avatar_url, u.college_id, u.is_coordinator, u.coordinator_type, u.coordinator_region, c.name
order by weekly_xp desc;

create unique index if not exists idx_mv_weekly_lb on public.mv_weekly_leaderboard(id);

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
  u.coordinator_type,
  u.coordinator_region,
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
  u.coordinator_type,
  u.coordinator_region,
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

drop materialized view if exists public.mv_monthly_leaderboard;
create materialized view public.mv_monthly_leaderboard as
select
  u.id,
  u.full_name,
  u.username,
  u.avatar_url,
  u.college_id,
  u.is_coordinator,
  u.coordinator_type,
  u.coordinator_region,
  c.name as college_name,
  coalesce(sum(xt.amount), 0) as monthly_xp
from public.users u
join public.colleges c on u.college_id = c.id
left join public.xp_transactions xt on u.id = xt.user_id
  and xt.created_at >= date_trunc('month', now())
where coalesce(u.is_banned, false) = false
group by u.id, u.full_name, u.username, u.avatar_url, u.college_id, u.is_coordinator, u.coordinator_type, u.coordinator_region, c.name
order by monthly_xp desc;

create unique index if not exists idx_mv_monthly_lb_id on public.mv_monthly_leaderboard(id);

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
  refresh materialized view concurrently public.mv_monthly_leaderboard;
end;
$$;

create or replace function public.detect_suspicious_xp_patterns()
returns table(user_id uuid, perfect_days bigint)
language sql
security definer
as $$
  select s.user_id, count(*)::bigint as perfect_days
  from (
    select
      xt.user_id,
      date(xt.created_at) as xp_day,
      sum(xt.amount) as daily_total
    from public.xp_transactions xt
    where xt.created_at > now() - interval '30 days'
    group by xt.user_id, date(xt.created_at)
    having sum(xt.amount) >= 95
  ) s
  group by s.user_id
  having count(*) >= 25;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'refresh_leaderboard_views_every_15_min') then
    perform cron.unschedule('refresh_leaderboard_views_every_15_min');
  end if;
end $$;

select cron.schedule(
  'refresh_leaderboard_views_every_15_min',
  '*/15 * * * *',
  $$ select public.refresh_leaderboard_views(); $$
);

do $$
begin
  if exists (select 1 from cron.job where jobname = 'weekly_detect_suspicious_xp_patterns') then
    perform cron.unschedule('weekly_detect_suspicious_xp_patterns');
  end if;
end $$;

select cron.schedule(
  'weekly_detect_suspicious_xp_patterns',
  '0 3 * * 1',
  $$
  insert into public.anti_cheat_flags (user_id, flag_type, severity, reason, metadata)
  select
    d.user_id,
    'perfect_daily_xp_pattern',
    'high',
    'User hit >=95 XP on 25+ days in last 30 days',
    jsonb_build_object('perfect_days', d.perfect_days)
  from public.detect_suspicious_xp_patterns() d
  where not exists (
    select 1
    from public.anti_cheat_flags f
    where f.user_id = d.user_id
      and f.flag_type = 'perfect_daily_xp_pattern'
      and f.created_at > now() - interval '7 days'
  );
  $$
);

commit;
