# Friend System Verification (Phase 2A)

## 1) Run migration

Run this migration in Supabase SQL Editor:

- `supabase/migrations/20260421_phase_2a_friend_system.sql`

This creates:
- `friend_requests`
- `friendships`
- all related indexes
- RLS policies for both tables

## 2) Run SQL integrity checks

Open and run:

- `supabase/seed/friend_system_verification.sql`

Before running, replace `user_a` and `user_b` placeholders with two real `users.id` values.

Expected output:
- notice: `OK: duplicate request prevented`
- notice: `Phase 2A SQL verification completed`

The script uses `rollback`, so it does not keep test data.

## 3) Verify app flow with two accounts (required for 2A.6)

Because SQL editor is privileged, RLS must be confirmed via real app sessions:

1. Sign in as Account A and search Account B.
2. Send friend request from A to B.
3. Sign in as Account B and confirm request appears in pending list.
4. Reject flow test:
   - Reject request in B.
   - Confirm A can send request again.
5. Accept flow test:
   - Send request A -> B again.
   - Accept in B.
   - Confirm both users appear in each other's friend list.
6. Remove flow test:
   - Remove friend from one account.
   - Confirm relation is removed for both sides.
7. Duplicate prevention test:
   - From A, attempt to send same request repeatedly.
   - Confirm only one pending request exists.

## 4) RLS spot checks (in-app behavior)

- A cannot accept a request unless A is the receiver.
- A cannot insert friendships for arbitrary third-party users.
- A only sees friend requests where A is sender or receiver.
- A only sees friendships where A is user or friend.
