-- ═══════════════════════════════════════════════
-- LUMIO — Initial Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  subscription_status text default 'free'
    check (subscription_status in ('free', 'active', 'cancelled', 'developer')),
  stripe_customer_id text,
  developer_code_used text,
  created_at timestamptz default now()
);

-- Developer codes (5 pre-seeded)
create table if not exists public.developer_codes (
  code text primary key,
  linked_email text unique,
  linked_at timestamptz
);

-- Habits
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target text,
  category text,
  created_at timestamptz default now()
);

-- Habit completions
create table if not exists public.habit_completions (
  habit_id uuid references public.habits(id) on delete cascade,
  completed_on date default current_date,
  primary key (habit_id, completed_on)
);

-- Tasks
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  priority text default 'media',
  status text default 'todo',
  tags text[],
  estimated_time text,
  created_at timestamptz default now()
);

-- Journal entries
create table if not exists public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text,
  mood int check (mood between 1 and 5),
  tags text[],
  created_at timestamptz default now()
);

-- Goals
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  deadline date,
  progress int default 0,
  category text,
  milestones text[],
  created_at timestamptz default now()
);

-- XP events
create table if not exists public.xp_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  xp int not null,
  created_at timestamptz default now()
);

-- Sleep records
create table if not exists public.sleep_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  hours numeric(3,1),
  quality int,
  unique (user_id, date)
);

-- ═══════════════════════════════════════════════
-- Auto-create profile on signup
-- ═══════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create profile after auth signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.tasks enable row level security;
alter table public.journal_entries enable row level security;
alter table public.goals enable row level security;
alter table public.xp_events enable row level security;
alter table public.sleep_records enable row level security;
alter table public.developer_codes enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Habits: users can CRUD their own
create policy "Users can manage own habits" on public.habits for all using (auth.uid() = user_id);

-- Habit completions: users can manage completions for their habits
create policy "Users can manage own completions" on public.habit_completions for all
  using (habit_id in (select id from public.habits where user_id = auth.uid()));

-- Tasks
create policy "Users can manage own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Journal
create policy "Users can manage own journal" on public.journal_entries for all using (auth.uid() = user_id);

-- Goals
create policy "Users can manage own goals" on public.goals for all using (auth.uid() = user_id);

-- XP events
create policy "Users can manage own xp" on public.xp_events for all using (auth.uid() = user_id);

-- Sleep
create policy "Users can manage own sleep" on public.sleep_records for all using (auth.uid() = user_id);

-- Developer codes: anyone can read (for validation), only service role can update
create policy "Anyone can read developer codes" on public.developer_codes for select using (true);

-- ═══════════════════════════════════════════════
-- Seed 5 developer codes
-- ═══════════════════════════════════════════════
insert into public.developer_codes (code) values
  ('LUMIO-DEV-7X9K2'),
  ('LUMIO-DEV-M4P8N'),
  ('LUMIO-DEV-Q2W5J'),
  ('LUMIO-DEV-R6T3Y'),
  ('LUMIO-DEV-V1H8S')
on conflict (code) do nothing;
