-- Create portfolio_logs table
create table if not exists portfolio_logs (
  id uuid default gen_random_uuid() primary key,
  user_id text, -- optional, if we want to track per user later
  items jsonb not null,
  total_value numeric not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table portfolio_logs enable row level security;

-- Policy to allow public access (for now, similar to other tables)
create policy "Allow public access to logs" on portfolio_logs for all using (true) with check (true);
