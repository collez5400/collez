## Phase 1K.5 — Leaderboard seed + verification

### 1) Seed Supabase (required)
- Open Supabase → **SQL Editor**
- First run (schema): `supabase/migrations/20260420_phase_0_supabase_schema.sql`
- Then run (seed): `supabase/seed/leaderboard_seed.sql`

This seeds:
- 2 approved colleges
- 30 dev users (`dev_user_1@collez.dev` ... `dev_user_30@collez.dev`)
- weekly `xp_transactions`
- refreshes `mv_college_leaderboard` and `mv_weekly_leaderboard`

### 2) Verify materialized views
Run these quick checks in SQL Editor:

```sql
select count(*) from public.mv_college_leaderboard;
select count(*) from public.mv_weekly_leaderboard;

-- sanity: top XP users
select full_name, xp, college_name, college_rank, national_rank
from public.mv_college_leaderboard
order by xp desc
limit 10;

-- sanity: top weekly XP
select full_name, weekly_xp, college_name
from public.mv_weekly_leaderboard
order by weekly_xp desc
limit 10;
```

### 3) Verify in the app UI
- Open app → **Rankings**
- Check each tab:
  - **College**: list shows ranks; your user row is highlighted if you’re one of the seeded users
  - **National**: ranks ordered by `national_rank`
  - **Weekly**: ordered by `weekly_xp`

### 4) Pagination test
- Scroll to bottom on each tab: should load more (page size 20)

### 5) Pull-to-refresh test
- Pull down to refresh: should refetch boards and keep UI stable

### 6) Cache test (15 min)
- Open Rankings once (loads + caches)
- Close app and reopen Rankings within 15 minutes
- It should show cached data instantly, then continue pagination normally.

