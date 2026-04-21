-- Phase 1L.3 — Daily quotes seed data (dev/admin)
-- Run in Supabase SQL Editor to seed 30 consecutive daily quotes.
-- This script is safe to re-run; it upserts by scheduled_date.

begin;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text,
  scheduled_date date unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_quotes_date on public.quotes(scheduled_date);

insert into public.quotes (text, author, scheduled_date, is_active)
values
  ('Progress over perfection.', 'COLLEZ', current_date + 0, true),
  ('Small wins every day become unstoppable momentum.', 'COLLEZ', current_date + 1, true),
  ('Your streak is a promise you keep to yourself.', 'COLLEZ', current_date + 2, true),
  ('Discipline beats motivation on difficult days.', 'COLLEZ', current_date + 3, true),
  ('Show up first. Results follow later.', 'COLLEZ', current_date + 4, true),
  ('Focus on the next hour, not the whole semester.', 'COLLEZ', current_date + 5, true),
  ('Consistency is your competitive edge.', 'COLLEZ', current_date + 6, true),
  ('Do the hard thing before the urgent thing.', 'COLLEZ', current_date + 7, true),
  ('A planned day is a calmer day.', 'COLLEZ', current_date + 8, true),
  ('You do not need perfect conditions to start.', 'COLLEZ', current_date + 9, true),
  ('Every class attended is a vote for your future.', 'COLLEZ', current_date + 10, true),
  ('Protect your time like your rank depends on it.', 'COLLEZ', current_date + 11, true),
  ('Make your notes clear today and your revision easy tomorrow.', 'COLLEZ', current_date + 12, true),
  ('Compete with your yesterday before competing with others.', 'COLLEZ', current_date + 13, true),
  ('One completed task is better than ten postponed plans.', 'COLLEZ', current_date + 14, true),
  ('Keep promises to yourself, especially the small ones.', 'COLLEZ', current_date + 15, true),
  ('Your daily routine writes your final results.', 'COLLEZ', current_date + 16, true),
  ('Clarity comes from action, not overthinking.', 'COLLEZ', current_date + 17, true),
  ('If it matters, schedule it.', 'COLLEZ', current_date + 18, true),
  ('Momentum grows when excuses shrink.', 'COLLEZ', current_date + 19, true),
  ('The next level starts with today''s discipline.', 'COLLEZ', current_date + 20, true),
  ('Deep work now saves panic later.', 'COLLEZ', current_date + 21, true),
  ('Your rank reflects repeated choices, not random luck.', 'COLLEZ', current_date + 22, true),
  ('Stay patient. Mastery is built quietly.', 'COLLEZ', current_date + 23, true),
  ('The best study plan is the one you actually follow.', 'COLLEZ', current_date + 24, true),
  ('You can be tired and still be consistent.', 'COLLEZ', current_date + 25, true),
  ('Structure your day before the day structures you.', 'COLLEZ', current_date + 26, true),
  ('Tiny improvements compound faster than you think.', 'COLLEZ', current_date + 27, true),
  ('Done is powerful when done daily.', 'COLLEZ', current_date + 28, true),
  ('Keep climbing. Your future self is watching.', 'COLLEZ', current_date + 29, true)
on conflict (scheduled_date) do update
set
  text = excluded.text,
  author = excluded.author,
  is_active = excluded.is_active;

commit;

