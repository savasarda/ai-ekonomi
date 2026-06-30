-- Create recurring payments table for subscriptions, fixed payments, and debts.
create table if not exists recurring_payments (
  id text primary key,
  family_id text not null,
  user_id text,
  account_id text,
  payment_type text not null default 'subscription'
    check (payment_type in ('subscription', 'debt', 'fixed')),
  name text not null,
  amount numeric not null check (amount > 0),
  due_day integer not null default 15 check (due_day between 1 and 28),
  total_installments integer check (total_installments is null or total_installments > 0),
  paid_installments integer default 0 check (paid_installments is null or paid_installments >= 0),
  start_date date,
  end_date date,
  status integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_recurring_payments_family_id
  on recurring_payments (family_id);

create index if not exists idx_recurring_payments_account_id
  on recurring_payments (account_id);

alter table recurring_payments enable row level security;

drop policy if exists "Enable all access for all users" on recurring_payments;
create policy "Enable all access for all users" on recurring_payments
  for all
  using (true)
  with check (true);

create or replace function set_recurring_payments_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recurring_payments_updated_at on recurring_payments;
create trigger trg_recurring_payments_updated_at
  before update on recurring_payments
  for each row
  execute function set_recurring_payments_updated_at();

do $$
begin
  alter publication supabase_realtime add table recurring_payments;
exception
  when duplicate_object then null;
end $$;
