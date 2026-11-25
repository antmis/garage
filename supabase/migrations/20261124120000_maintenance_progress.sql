-- Garage: which maintenance checklist items are done, per (email, vehicle).
create table public.maintenance_progress (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null,
  vehicle_id text not null default 'tacoma-2024',
  item_id text not null,
  completed_at timestamptz not null default now(),
  unique (owner_email, vehicle_id, item_id)
);

alter table public.maintenance_progress enable row level security;

-- Supabase no longer grants new public tables to the API roles by default.
grant select, insert, update, delete on public.maintenance_progress to anon, authenticated;

-- TEMPORARY, INTENTIONALLY OPEN: the app identifies people by a typed, unverified email
-- (`owner_email`), so these policies let anyone with the anon key read and write any row.
-- Replace them with `owner_id = auth.uid()` policies (and swap `owner_email` for a user id
-- column) when real Supabase Auth is added. Do not store anything sensitive here.
create policy "temp_open_anon_select" on public.maintenance_progress
  for select to anon, authenticated using (true);

create policy "temp_open_anon_insert" on public.maintenance_progress
  for insert to anon, authenticated with check (true);

create policy "temp_open_anon_update" on public.maintenance_progress
  for update to anon, authenticated using (true) with check (true);

create policy "temp_open_anon_delete" on public.maintenance_progress
  for delete to anon, authenticated using (true);
