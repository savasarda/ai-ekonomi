-- Create portfolios table
create table if not exists portfolios (
  id text primary key,
  items jsonb,
  last_total numeric,
  last_updated timestamptz default now()
);

-- Enable RLS (optional, keeping it simple for now)
alter table portfolios enable row level security;

-- Policy to allow all access (since auth is not fully implemented/anon)
create policy "Allow public access" on portfolios for all using (true) with check (true);
