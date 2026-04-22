-- Phase 4B.4: Remote config feature flags + A/B testing
begin;

create table if not exists public.app_config_entries (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ab_test_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  test_key text not null,
  variant text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ab_test_events_test_key_created
  on public.ab_test_events(test_key, created_at desc);

create index if not exists idx_ab_test_events_user_created
  on public.ab_test_events(user_id, created_at desc);

alter table public.app_config_entries enable row level security;
alter table public.ab_test_events enable row level security;

drop policy if exists "authenticated_can_read_app_config" on public.app_config_entries;
create policy "authenticated_can_read_app_config"
  on public.app_config_entries
  for select
  to authenticated
  using (true);

drop policy if exists "users_can_insert_own_ab_events" on public.ab_test_events;
create policy "users_can_insert_own_ab_events"
  on public.ab_test_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);

insert into public.app_config_entries (key, value, description)
values
  (
    'feature_flags',
    jsonb_build_object(
      'premium_themes_v2', jsonb_build_object(
        'default', true,
        'segments', jsonb_build_object(
          'coordinator', true,
          'premium', true,
          'non_premium', true,
          'new_users_7d', true
        )
      ),
      'friend_challenges_v2', jsonb_build_object(
        'default', true,
        'segments', jsonb_build_object(
          'coordinator', true,
          'premium', true,
          'non_premium', true,
          'new_users_7d', true
        )
      ),
      'vault_cloud_restore_banner', jsonb_build_object(
        'default', true,
        'segments', jsonb_build_object(
          'coordinator', true,
          'premium', true,
          'non_premium', false,
          'new_users_7d', true
        )
      )
    ),
    'Remote feature toggles per user segment'
  ),
  (
    'ab_experiments',
    jsonb_build_object(
      'home_quote_layout', jsonb_build_object(
        'enabled', true,
        'variants', jsonb_build_object(
          'A', 50,
          'B', 50
        )
      ),
      'rankings_header_density', jsonb_build_object(
        'enabled', true,
        'variants', jsonb_build_object(
          'A', 70,
          'B', 30
        )
      )
    ),
    'A/B experiments with weighted variant splits'
  )
on conflict (key) do nothing;

commit;
