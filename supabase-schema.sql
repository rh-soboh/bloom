-- ITERATION 1 DATABASE

-- pgcrypto supplies gen_random_uuid(), which creates secure unique IDs.
create extension if not exists pgcrypto;

-- A user can own many routines, but each routine belongs to one auth user.
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

-- A routine can contain many habits, but each habit belongs to one routine.
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  created_at timestamptz not null default now()
);

-- A new row is created whenever a user completes a habit on a date.
-- The absence of a row means that habit is not completed for that date.
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null default current_date,
  unique (habit_id, user_id, completed_on)
);

-- Indexes help Supabase find a user's data quickly.
create index if not exists routines_user_id_index on public.routines(user_id);
create index if not exists habits_routine_id_index on public.habits(routine_id);
create index if not exists completions_user_date_index
  on public.habit_completions(user_id, completed_on);

-- Row Level Security stops users from reading or changing another user's data.
alter table public.routines enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

-- A user can only manage routine rows containing their own user ID.
drop policy if exists "Users manage their routines" on public.routines;
create policy "Users manage their routines"
on public.routines for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- habits has no user_id, so ownership is checked through its parent routine.
drop policy if exists "Users manage habits in their routines" on public.habits;
create policy "Users manage habits in their routines"
on public.habits for all
using (
  exists (
    select 1 from public.routines
    where routines.id = habits.routine_id
      and routines.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.routines
    where routines.id = habits.routine_id
      and routines.user_id = auth.uid()
  )
);

-- Completion ownership is also checked through the habit's parent routine.
drop policy if exists "Users manage their habit completions" on public.habit_completions;
create policy "Users manage their habit completions"
on public.habit_completions for all
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.habits
    join public.routines on routines.id = habits.routine_id
    where habits.id = habit_completions.habit_id
      and routines.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.habits
    join public.routines on routines.id = habits.routine_id
    where habits.id = habit_completions.habit_id
      and routines.user_id = auth.uid()
  )
);
