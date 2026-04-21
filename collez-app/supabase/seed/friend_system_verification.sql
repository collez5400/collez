-- Phase 2A verification script (run in Supabase SQL editor)
-- Purpose: validate duplicate prevention and basic friend data integrity.
--
-- NOTE:
-- RLS behavior must be verified with two real auth sessions (A and B)
-- from the app because SQL editor runs as a privileged role.

begin;

-- Replace these IDs with two real users from your project.
do $$
declare
  user_a uuid := '00000000-0000-0000-0000-000000000001';
  user_b uuid := '00000000-0000-0000-0000-000000000002';
  req_id uuid;
begin
  if user_a = user_b then
    raise exception 'user_a and user_b must be different';
  end if;

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
      raise notice 'OK: duplicate request prevented';
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

  raise notice 'Phase 2A SQL verification completed';
end $$;

rollback;
