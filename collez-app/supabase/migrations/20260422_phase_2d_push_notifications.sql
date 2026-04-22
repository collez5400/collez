-- Phase 2D: Push notifications (Supabase)
-- Adds Expo push token storage + notification preferences.
-- Adds basic event notification tracking fields and an optional rank snapshot table.

begin;

-- 1) Users: push token + prefs
alter table public.users
  add column if not exists push_token text,
  add column if not exists push_enabled boolean not null default true,
  add column if not exists push_streak_enabled boolean not null default true,
  add column if not exists push_event_enabled boolean not null default true;

create index if not exists idx_users_push_enabled on public.users(push_enabled);
create index if not exists idx_users_push_token on public.users(push_token);

-- 2) Events: track whether pushes were already sent
alter table public.events
  add column if not exists push_live_sent_at timestamptz,
  add column if not exists push_ending_soon_sent_at timestamptz;

create index if not exists idx_events_push_live_sent on public.events(push_live_sent_at);

-- 3) Rank snapshots (optional, used for “dropped ranks” nudges)
create table if not exists public.user_rank_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  snapshot_date date not null,
  national_rank integer,
  college_rank integer,
  created_at timestamptz not null default now(),
  unique(user_id, snapshot_date)
);

create index if not exists idx_rank_snapshots_user_date on public.user_rank_snapshots(user_id, snapshot_date);

alter table public.user_rank_snapshots enable row level security;

-- Only service role / edge functions should read/write snapshots
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_rank_snapshots'
      and policyname = 'No direct access to rank snapshots'
  ) then
    execute $pol$
      create policy "No direct access to rank snapshots"
      on public.user_rank_snapshots
      for all
      using (false)
      with check (false);
    $pol$;
  end if;
end $$;

commit;

