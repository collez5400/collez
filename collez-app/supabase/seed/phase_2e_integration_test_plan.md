# Phase 2E Integration Test Plan

Run this after applying SQL migrations up to Phase 2E.

## 1) Supabase Preconditions

- Apply migrations in order:
  1. `20260420_phase_0_supabase_schema.sql`
  2. `20260421_phase_2a_friend_system.sql`
  3. `20260422_phase_2c_coordinator_system.sql`
  4. `20260422_phase_2d_push_notifications.sql`
  5. `20260422_phase_2e_streak_shield_city_state.sql`
- Deploy edge functions:
  - `award-xp`
  - `log-streak-action`
  - `notify-event-live`
  - `send-event-ending-soon`
  - `send-streak-reminders`
  - `snapshot-ranks`

## 2) Schema Checks

- Confirm these columns exist:
  - `users.streak_shields`
  - `users.streak_shield_active`
  - `users.push_token`
  - `events.push_live_sent_at`
  - `events.push_ending_soon_sent_at`
- Confirm these materialized views exist:
  - `mv_college_leaderboard`
  - `mv_city_leaderboard`
  - `mv_state_leaderboard`
  - `mv_weekly_leaderboard`

## 3) App Flow Checks

## A. Streak Shield

1. Seed a test user with:
   - `streak_count = 29`
   - `streak_shields = 0`
   - `streak_shield_active = false`
2. Perform one qualifying action.
3. Verify:
   - `streak_count = 30`
   - `streak_shields = 1`
4. Activate shield from home streak pill.
5. Simulate a one-day miss (set `last_active_date` to 2 days ago).
6. Perform a qualifying action.
7. Verify:
   - Streak does not reset.
   - `streak_shields` decrements by 1.
   - `streak_shield_active` turns false.

## B. City/State Rankings

1. Create at least 3 colleges in same city and state, with seeded users.
2. Refresh leaderboard views:
   - `select public.refresh_leaderboard_views();`
3. In app rankings screen:
   - Verify tabs `City` and `State` render.
   - Verify rank order follows XP descending.
   - Verify current user rank card updates per tab.

## C. Cross-feature Regression

1. Join trivia event and complete it.
2. Verify XP is awarded and stored.
3. Refresh rankings.
4. Verify leaderboard position changes.
5. Trigger event live notification from admin.
6. Tap notification and verify deep-link to trivia screen.

## 4) Commands

- Typecheck:
  - `npx tsc --noEmit`
- Web preview:
  - `npx expo start --web --port 8082`

## 5) Expected Result

All tests above pass without runtime error, and no new TypeScript/lint issues are introduced.
