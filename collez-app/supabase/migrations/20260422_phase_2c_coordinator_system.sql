-- Phase 2C: Coordinator system (Supabase)
-- Creates coordinator_applications table + basic RLS.
-- Also updates leaderboard materialized views to expose is_coordinator.

begin;

-- 1) Coordinator applications
create table if not exists public.coordinator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  college_id uuid references public.colleges(id) not null,
  full_name text not null,
  whatsapp_number text not null,
  email text not null,
  reason text not null,
  college_id_photo_url text not null,
  selfie_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_coord_apps_status on public.coordinator_applications(status);
create index if not exists idx_coord_apps_college on public.coordinator_applications(college_id);
create index if not exists idx_coord_apps_user on public.coordinator_applications(user_id);

alter table public.coordinator_applications enable row level security;

-- Allow authenticated users to create their own application
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'coordinator_applications'
      and policyname = 'Users insert own coordinator application'
  ) then
    execute $pol$
      create policy "Users insert own coordinator application"
      on public.coordinator_applications
      for insert
      with check (auth.uid() = user_id);
    $pol$;
  end if;
end $$;

-- Allow authenticated users to read only their own applications
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'coordinator_applications'
      and policyname = 'Users read own coordinator applications'
  ) then
    execute $pol$
      create policy "Users read own coordinator applications"
      on public.coordinator_applications
      for select
      using (auth.uid() = user_id);
    $pol$;
  end if;
end $$;

-- 2) Materialized views: expose is_coordinator so the app can render a verified badge in leaderboard rows.
-- NOTE: these are "replace" statements; safe to run on an existing DB.

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
  c.name as college_name,
  coalesce(sum(xt.amount), 0) as weekly_xp
from public.users u
join public.colleges c on u.college_id = c.id
left join public.xp_transactions xt on u.id = xt.user_id
  and xt.created_at >= date_trunc('week', now())
where coalesce(u.is_banned, false) = false
group by u.id, u.full_name, u.username, u.avatar_url, u.college_id, u.is_coordinator, c.name
order by weekly_xp desc;

create unique index if not exists idx_mv_weekly_lb on public.mv_weekly_leaderboard(id);

commit;

