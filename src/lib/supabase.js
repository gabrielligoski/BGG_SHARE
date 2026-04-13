import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project URL and anon key
// Get these from: https://app.supabase.com → Project Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/*
══════════════════════════════════════════════════════════════════
  SUPABASE SQL SETUP — Run this in your Supabase SQL Editor
  https://app.supabase.com → SQL Editor → New Query
══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Board games table
create table public.boardgames (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  image_url text,
  bought_price numeric(10,2) not null default 0,
  housing_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ownership shares table (percentage per person per game)
create table public.ownership_shares (
  id uuid default uuid_generate_v4() primary key,
  boardgame_id uuid references public.boardgames(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  percentage numeric(5,2) not null check (percentage > 0 and percentage <= 100),
  unique(boardgame_id, user_id)
);

-- Housing history log
create table public.housing_history (
  id uuid default uuid_generate_v4() primary key,
  boardgame_id uuid references public.boardgames(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  moved_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.boardgames enable row level security;
alter table public.ownership_shares enable row level security;
alter table public.housing_history enable row level security;

-- Policies: authenticated users can read all, write their own
create policy "Public profiles read" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "All authenticated read games" on public.boardgames for select using (auth.role() = 'authenticated');
create policy "All authenticated insert games" on public.boardgames for insert with check (auth.role() = 'authenticated');
create policy "All authenticated update games" on public.boardgames for update using (auth.role() = 'authenticated');
create policy "All authenticated delete games" on public.boardgames for delete using (auth.role() = 'authenticated');

create policy "All authenticated read shares" on public.ownership_shares for select using (auth.role() = 'authenticated');
create policy "All authenticated manage shares" on public.ownership_shares for all using (auth.role() = 'authenticated');

create policy "All authenticated read history" on public.housing_history for select using (auth.role() = 'authenticated');
create policy "All authenticated insert history" on public.housing_history for insert with check (auth.role() = 'authenticated');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for game images
insert into storage.buckets (id, name, public) values ('game-images', 'game-images', true);
create policy "Public read images" on storage.objects for select using (bucket_id = 'game-images');
create policy "Auth upload images" on storage.objects for insert with check (bucket_id = 'game-images' and auth.role() = 'authenticated');
create policy "Auth delete images" on storage.objects for delete using (bucket_id = 'game-images' and auth.role() = 'authenticated');

══════════════════════════════════════════════════════════════════
*/
