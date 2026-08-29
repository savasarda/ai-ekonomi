create table public.user_dashboard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  person_order text[] not null default '{}',
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.user_dashboard_preferences enable row level security;

grant select, insert, update on table public.user_dashboard_preferences to authenticated;

create policy "Users can view their own dashboard preferences"
on public.user_dashboard_preferences
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add their own dashboard preferences"
on public.user_dashboard_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own dashboard preferences"
on public.user_dashboard_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
