
-- Create table for Needs List items
create table if not exists needs_list (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Create table for tracking item usage stats (Smart Suggestions)
create table if not exists needs_stats (
  item_name text primary key,
  count integer default 1,
  last_added_at timestamptz default now()
);

-- Set up RLS (Row Level Security) - Optional but good practice
-- For this simple app, we might skip complex policies or allow public access if no auth is used.
-- Assuming anon key has access.
alter table needs_list enable row level security;
create policy "Allow public access to needs_list" on needs_list to anon using (true) with check (true);

alter table needs_stats enable row level security;
create policy "Allow public access to needs_stats" on needs_stats to anon using (true) with check (true);
