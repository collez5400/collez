-- Phase 2A — Friend system schema + RLS policies
-- Run after base schema migration.

begin;

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_requests_sender_receiver_unique unique (sender_id, receiver_id),
  constraint friend_requests_no_self_request check (sender_id <> receiver_id)
);

create index if not exists idx_friend_requests_receiver_status
  on public.friend_requests(receiver_id, status);
create index if not exists idx_friend_requests_sender_status
  on public.friend_requests(sender_id, status);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  friend_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_user_friend_unique unique (user_id, friend_id),
  constraint friendships_no_self_friend check (user_id <> friend_id)
);

create index if not exists idx_friendships_user_id on public.friendships(user_id);
create index if not exists idx_friendships_friend_id on public.friendships(friend_id);

alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "friend_requests_select_own" on public.friend_requests;
create policy "friend_requests_select_own"
on public.friend_requests
for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "friend_requests_insert_sender_only" on public.friend_requests;
create policy "friend_requests_insert_sender_only"
on public.friend_requests
for insert
with check (
  auth.uid() = sender_id
  and auth.uid() <> receiver_id
  and status = 'pending'
);

drop policy if exists "friend_requests_update_receiver_only" on public.friend_requests;
create policy "friend_requests_update_receiver_only"
on public.friend_requests
for update
using (
  auth.uid() = receiver_id
  and status = 'pending'
)
with check (
  auth.uid() = receiver_id
  and status in ('accepted', 'rejected')
);

drop policy if exists "friendships_select_participants" on public.friendships;
create policy "friendships_select_participants"
on public.friendships
for select
using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "friendships_insert_owner_only" on public.friendships;
create policy "friendships_insert_owner_only"
on public.friendships
for insert
with check (auth.uid() = user_id and auth.uid() <> friend_id);

drop policy if exists "friendships_delete_participants" on public.friendships;
create policy "friendships_delete_participants"
on public.friendships
for delete
using (auth.uid() = user_id or auth.uid() = friend_id);

commit;
