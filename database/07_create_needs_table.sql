-- Create 'needs' table
create table if not exists needs (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table needs enable row level security;

-- Create policy to allow all actions for now (since auth might be simple/anon)
create policy "Enable all access for all users" on needs
    for all
    using (true)
    with check (true);

-- Enable realtime
alter publication supabase_realtime add table needs;
