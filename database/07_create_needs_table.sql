-- Create 'needs_list' table
create table if not exists needs_list (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  completed boolean default false,
  family_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table needs_list enable row level security;

-- Create policy to allow all actions for now
-- In a real app, you'd filter by family_id
create policy "Enable all access for all users" on needs_list
    for all
    using (true)
    with check (true);

-- Enable realtime
alter publication supabase_realtime add table needs_list;

