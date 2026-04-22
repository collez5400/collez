-- Phase 2A verification script (run in Supabase SQL editor)
-- Purpose: validate duplicate prevention and basic friend data integrity
-- without manually editing user UUIDs.
--
-- NOTE:
-- RLS behavior must be verified with two real auth sessions (A and B)
-- from the app because SQL editor runs as a privileged role.

begin;

do $$
declare
  user_a uuid;
  user_b uuid;
  user_a_username text;
  user_b_username text;
  req_id uuid;
begin
  -- Auto-pick two distinct users from your users table.
  -- If you want deterministic picks, replace this query with:
  -- select id, username into user_a, user_a_username from public.users where username = '...';
  -- select id, username into user_b, user_b_username from public.users where username = '...';
  with picked as (
    select
      id,
      username,
      row_number() over (order by created_at asc, id asc) as rn
    from public.users
    where coalesce(is_banned, false) = false
    limit 2
  )
  select p1.id, p2.id, p1.username, p2.username
  into user_a, user_b, user_a_username, user_b_username
  from picked p1
  join picked p2 on p1.rn = 1 and p2.rn = 2;

  if user_a is null or user_b is null then
    raise exception 'Need at least 2 users in public.users to run friend verification';
  end if;

  if user_a = user_b then
    raise exception 'user_a and user_b must be different';
  end if;

  raise notice 'Using users: A=% (%), B=% (%)', user_a_username, user_a, user_b_username, user_b;

  -- Clean prior test data for this pair.
  delete from public.friendships
  where (user_id = user_a and friend_id = user_b)
     or (user_id = user_b and friend_id = user_a);

  delete from public.friend_requests
  where (sender_id = user_a and receiver_id = user_b)
     or (sender_id = user_b and receiver_id = user_a);

  -- A sends request to B.
  insert into public.friend_requests (sender_id, receiver_id, status)
  values (user_a, user_b, 'pending')
  returning id into req_id;

  -- Duplicate request should fail (unique constraint).
  begin
    insert into public.friend_requests (sender_id, receiver_id, status)
    values (user_a, user_b, 'pending');
    raise exception 'duplicate request was inserted unexpectedly';
  exception
    when unique_violation then
      raise notice 'OK: duplicate request prevented for % -> %', user_a_username, user_b_username;
  end;

  -- Simulate acceptance by B and create bi-directional friendships.
  update public.friend_requests
  set status = 'accepted', updated_at = now()
  where id = req_id;

  insert into public.friendships (user_id, friend_id)
  values (user_a, user_b), (user_b, user_a)
  on conflict (user_id, friend_id) do nothing;

  -- Verify symmetrical friendship rows.
  if not exists (
    select 1 from public.friendships where user_id = user_a and friend_id = user_b
  ) or not exists (
    select 1 from public.friendships where user_id = user_b and friend_id = user_a
  ) then
    raise exception 'friendship symmetry check failed';
  end if;

  -- Cleanup test rows.
  delete from public.friendships
  where (user_id = user_a and friend_id = user_b)
     or (user_id = user_b and friend_id = user_a);

  delete from public.friend_requests
  where (sender_id = user_a and receiver_id = user_b)
     or (sender_id = user_b and receiver_id = user_a);

  raise notice 'Phase 2A SQL verification completed successfully';
end $$;

rollback;
