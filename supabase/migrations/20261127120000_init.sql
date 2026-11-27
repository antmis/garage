-- Garage on Supabase Auth: vehicles, completion state, and provider-ready vehicle data (snapshots, external ids).
-- Every row is owned by an auth user. Policies never join: each table carries its own user_id, and composite FKs
-- stop a child row pointing at someone else's vehicle.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- vehicles: user-confirmed values. Decoded data is only ever a suggestion the user applies.
-- ---------------------------------------------------------------------------------------------------------------
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Built-in maintenance schedule (src/data/index.ts vehicle id, e.g. 'tacoma-2024'); null = custom vehicle.
  catalog_key text check (catalog_key is null or char_length(catalog_key) between 1 and 64),
  nickname text check (char_length(nickname) <= 80),
  vehicle_type text not null default 'car'
    check (vehicle_type in ('car', 'truck', 'motorcycle', 'other')),
  vin text check (vin is null or vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  model_year smallint check (model_year between 1950 and 2100),
  make text check (char_length(make) <= 80),
  model text check (char_length(model) <= 80),
  "trim" text check (char_length("trim") <= 80),
  body_class text check (char_length(body_class) <= 80),
  drive_type text check (char_length(drive_type) <= 80),
  engine_displacement_l numeric(4, 1) check (engine_displacement_l > 0),
  engine_cylinders smallint check (engine_cylinders between 1 and 32),
  fuel_type text check (char_length(fuel_type) <= 80),
  transmission text check (char_length(transmission) <= 80),
  odometer integer check (odometer >= 0),
  odometer_unit text not null default 'mi' check (odometer_unit in ('mi', 'km')),
  purchased_on date,
  notes text check (char_length(notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, vin),
  -- One row per built-in vehicle per user, so the first-launch seed is an idempotent upsert.
  unique (user_id, catalog_key),
  -- Target of the child tables' composite FKs.
  unique (id, user_id)
);

alter table public.vehicles enable row level security;

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function private.set_updated_at();

-- (user_id, vin) and (user_id, catalog_key) indexes lead with user_id, which covers the policies and the FK.

-- ---------------------------------------------------------------------------------------------------------------
-- vehicle_external_ids: e.g. a future VCdb BaseVehicleID or a provider's own vehicle id.
-- ---------------------------------------------------------------------------------------------------------------
create table public.vehicle_external_ids (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_id uuid not null,
  provider text not null check (char_length(provider) between 1 and 64),
  id_type text not null check (char_length(id_type) between 1 and 64),
  value text not null check (char_length(value) between 1 and 256),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vehicle_id, provider, id_type),
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade
);

alter table public.vehicle_external_ids enable row level security;

create index vehicle_external_ids_user_id_idx on public.vehicle_external_ids (user_id);
create index vehicle_external_ids_vehicle_user_idx on public.vehicle_external_ids (vehicle_id, user_id);

create trigger vehicle_external_ids_set_updated_at
  before update on public.vehicle_external_ids
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------------------------------------------
-- vehicle_data_snapshots: provenance for every external lookup. Written only by the vehicle-data Edge Function
-- (secret key, user_id taken from the verified JWT), so clients get read and delete, never insert or update.
-- ---------------------------------------------------------------------------------------------------------------
create table public.vehicle_data_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_id uuid not null,
  provider text not null check (char_length(provider) between 1 and 64), -- free text: 'nhtsa_vpic', ...
  kind text not null check (char_length(kind) between 1 and 64),         -- 'vin_decode' | 'recalls' | ...
  request_key text not null check (char_length(request_key) between 1 and 256),
  status text not null check (status in ('ok', 'partial', 'error')),
  error_code text,
  error_text text,
  normalized jsonb,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz,
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade
);

alter table public.vehicle_data_snapshots enable row level security;

create index vehicle_data_snapshots_user_id_idx on public.vehicle_data_snapshots (user_id);
create index vehicle_data_snapshots_vehicle_kind_idx
  on public.vehicle_data_snapshots (vehicle_id, kind, fetched_at desc);
create index vehicle_data_snapshots_vehicle_user_idx on public.vehicle_data_snapshots (vehicle_id, user_id);

-- ---------------------------------------------------------------------------------------------------------------
-- maintenance_completions: row exists = done; delete row = undone. The schedule itself stays in code.
-- task_key/interval_key split the app's item id at its first ':' ('30k:dusty:oil' -> '30k' + 'dusty:oil').
-- ---------------------------------------------------------------------------------------------------------------
create table public.maintenance_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_id uuid not null,
  task_key text not null check (char_length(task_key) between 1 and 128),
  interval_key text not null check (char_length(interval_key) between 1 and 32),
  completed_at timestamptz not null default now(),
  odometer integer check (odometer >= 0),
  notes text check (char_length(notes) <= 4000),
  unique (vehicle_id, task_key, interval_key),
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade
);

alter table public.maintenance_completions enable row level security;

create index maintenance_completions_user_id_idx on public.maintenance_completions (user_id);
create index maintenance_completions_vehicle_user_idx on public.maintenance_completions (vehicle_id, user_id);

-- ---------------------------------------------------------------------------------------------------------------
-- vin_decode_cache: server-only. RLS on with no policies and no grants: only the secret key (service_role) reads
-- or writes it, from the Edge Function. Shared across users because a VIN decode is not personal data.
-- ---------------------------------------------------------------------------------------------------------------
create table public.vin_decode_cache (
  provider text not null,
  vin text not null check (vin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  model_year smallint,
  status text not null check (status in ('ok', 'partial', 'error')),
  error_code text,
  error_text text,
  normalized jsonb,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (provider, vin)
);

alter table public.vin_decode_cache enable row level security;

-- ---------------------------------------------------------------------------------------------------------------
-- Grants. New public tables may or may not be auto-granted to the API roles depending on the project, so state
-- them explicitly: nothing for anon, only what each table's policies allow for authenticated.
-- ---------------------------------------------------------------------------------------------------------------
revoke all on public.vehicles, public.vehicle_external_ids, public.vehicle_data_snapshots,
  public.maintenance_completions, public.vin_decode_cache from anon, authenticated;

grant select, insert, update, delete on public.vehicles to authenticated;
grant select, insert, update, delete on public.vehicle_external_ids to authenticated;
grant select, delete on public.vehicle_data_snapshots to authenticated;
grant select, insert, update, delete on public.maintenance_completions to authenticated;

grant all on public.vehicles, public.vehicle_external_ids, public.vehicle_data_snapshots,
  public.maintenance_completions, public.vin_decode_cache to service_role;

-- ---------------------------------------------------------------------------------------------------------------
-- Policies: one per operation, `to authenticated`, auth.uid() wrapped in a select so it is evaluated once per
-- statement.
-- ---------------------------------------------------------------------------------------------------------------
create policy vehicles_select on public.vehicles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy vehicles_insert on public.vehicles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy vehicles_update on public.vehicles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy vehicles_delete on public.vehicles
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy vehicle_external_ids_select on public.vehicle_external_ids
  for select to authenticated using ((select auth.uid()) = user_id);
create policy vehicle_external_ids_insert on public.vehicle_external_ids
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy vehicle_external_ids_update on public.vehicle_external_ids
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy vehicle_external_ids_delete on public.vehicle_external_ids
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy vehicle_data_snapshots_select on public.vehicle_data_snapshots
  for select to authenticated using ((select auth.uid()) = user_id);
create policy vehicle_data_snapshots_delete on public.vehicle_data_snapshots
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy maintenance_completions_select on public.maintenance_completions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy maintenance_completions_insert on public.maintenance_completions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy maintenance_completions_update on public.maintenance_completions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy maintenance_completions_delete on public.maintenance_completions
  for delete to authenticated using ((select auth.uid()) = user_id);
