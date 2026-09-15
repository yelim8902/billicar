create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.vehicle_status as enum ('draft', 'pending_review', 'available', 'reserved', 'rented', 'maintenance', 'inactive');
create type public.booking_status as enum ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected', 'disputed');
create type public.payment_status as enum ('pending', 'escrowed', 'released', 'refunded', 'failed');
create type public.payment_kind as enum ('rental', 'deposit', 'insurance', 'refund');
create type public.trip_event_type as enum ('pickup', 'start', 'pause', 'resume', 'return', 'damage_report');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  phone text,
  avatar_url text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chain_id integer not null default 1001,
  address text not null check (address ~ '^0x[0-9a-fA-F]{40}$'),
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  unique (chain_id, address)
);
create unique index wallets_one_primary_per_user on public.wallets(user_id) where is_primary;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete restrict,
  status public.vehicle_status not null default 'draft',
  vin_hash text not null unique,
  plate_number_masked text,
  make text not null,
  model text not null,
  year smallint not null check (year between 1990 and 2100),
  seat_count smallint not null default 5 check (seat_count between 2 and 15),
  fuel_type text not null check (fuel_type in ('electric', 'hybrid', 'gasoline', 'diesel', 'hydrogen')),
  price_per_hour bigint not null check (price_per_hour > 0),
  deposit_amount bigint not null default 0 check (deposit_amount >= 0),
  location_name text not null,
  latitude numeric(9,6) not null check (latitude between -90 and 90),
  longitude numeric(9,6) not null check (longitude between -180 and 180),
  nft_chain_id integer,
  nft_contract_address text,
  nft_token_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicles_status_idx on public.vehicles(status);
create index vehicles_host_idx on public.vehicles(host_id);
create index vehicles_location_idx on public.vehicles(latitude, longitude);

create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  storage_path text not null,
  is_primary boolean not null default false,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);
create unique index vehicle_photos_one_primary on public.vehicle_photos(vehicle_id) where is_primary;

create table public.vehicle_availability (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index vehicle_availability_lookup_idx on public.vehicle_availability(vehicle_id, starts_at, ends_at);

create table public.insurance_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  fee bigint not null check (fee >= 0),
  coverage jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  renter_id uuid not null references public.profiles(id) on delete restrict,
  insurance_plan_id uuid references public.insurance_plans(id) on delete set null,
  status public.booking_status not null default 'pending',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  rental_fee bigint not null check (rental_fee >= 0),
  insurance_fee bigint not null default 0 check (insurance_fee >= 0),
  deposit_amount bigint not null default 0 check (deposit_amount >= 0),
  total_amount bigint generated always as (rental_fee + insurance_fee + deposit_amount) stored,
  pickup_type text not null default 'self' check (pickup_type in ('self', 'delivery')),
  pickup_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
alter table public.bookings add constraint bookings_no_overlap
  exclude using gist (vehicle_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
  where (status in ('pending', 'confirmed', 'active'));
create index bookings_renter_idx on public.bookings(renter_id, created_at desc);
create index bookings_vehicle_idx on public.bookings(vehicle_id, starts_at);

create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  started_at timestamptz,
  ended_at timestamptz,
  start_odometer_km numeric(10,1),
  end_odometer_km numeric(10,1),
  start_condition_cid text,
  end_condition_cid text,
  trip_hash text,
  created_at timestamptz not null default now(),
  check (ended_at is null or started_at is null or ended_at >= started_at)
);

create table public.trip_events (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references public.rentals(id) on delete cascade,
  event_type public.trip_event_type not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  metadata jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);
create index trip_events_rental_idx on public.trip_events(rental_id, recorded_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete restrict,
  payer_id uuid not null references public.profiles(id) on delete restrict,
  kind public.payment_kind not null,
  status public.payment_status not null default 'pending',
  amount bigint not null check (amount >= 0),
  currency text not null default 'W-KRW',
  chain_id integer,
  tx_hash text unique,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
create index payments_booking_idx on public.payments(booking_id);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  host_id uuid not null references public.profiles(id) on delete restrict,
  gross_amount bigint not null check (gross_amount >= 0),
  platform_fee bigint not null check (platform_fee >= 0),
  host_amount bigint generated always as (gross_amount - platform_fee) stored,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  tx_hash text unique,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  check (platform_fee <= gross_amount)
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger vehicles_set_updated_at before update on public.vehicles for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'MobiTrust 사용자'));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.vehicle_availability enable row level security;
alter table public.insurance_plans enable row level security;
alter table public.bookings enable row level security;
alter table public.rentals enable row level security;
alter table public.trip_events enable row level security;
alter table public.payments enable row level security;
alter table public.settlements enable row level security;

create policy "users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "users manage own wallets" on public.wallets for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "public reads listed vehicles" on public.vehicles for select to anon, authenticated using (status in ('available', 'reserved', 'rented'));
create policy "hosts manage own vehicles" on public.vehicles for all to authenticated using ((select auth.uid()) = host_id) with check ((select auth.uid()) = host_id);
create policy "public reads listed vehicle photos" on public.vehicle_photos for select to anon, authenticated using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.status in ('available', 'reserved', 'rented')));
create policy "hosts manage own vehicle photos" on public.vehicle_photos for all to authenticated using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.host_id = (select auth.uid()))) with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.host_id = (select auth.uid())));
create policy "public reads availability" on public.vehicle_availability for select to anon, authenticated using (true);
create policy "hosts manage availability" on public.vehicle_availability for all to authenticated using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.host_id = (select auth.uid()))) with check (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.host_id = (select auth.uid())));
create policy "public reads active insurance plans" on public.insurance_plans for select to anon, authenticated using (is_active);
create policy "booking parties read bookings" on public.bookings for select to authenticated using (renter_id = (select auth.uid()) or exists (select 1 from public.vehicles v where v.id = vehicle_id and v.host_id = (select auth.uid())));
create policy "renters create bookings" on public.bookings for insert to authenticated with check (renter_id = (select auth.uid()));
create policy "renters update own pending bookings" on public.bookings for update to authenticated using (renter_id = (select auth.uid()) and status = 'pending') with check (renter_id = (select auth.uid()));
create policy "booking parties read rentals" on public.rentals for select to authenticated using (exists (select 1 from public.bookings b join public.vehicles v on v.id = b.vehicle_id where b.id = booking_id and (b.renter_id = (select auth.uid()) or v.host_id = (select auth.uid()))));
create policy "booking parties read trip events" on public.trip_events for select to authenticated using (exists (select 1 from public.rentals r join public.bookings b on b.id = r.booking_id join public.vehicles v on v.id = b.vehicle_id where r.id = rental_id and (b.renter_id = (select auth.uid()) or v.host_id = (select auth.uid()))));
create policy "payers read own payments" on public.payments for select to authenticated using (payer_id = (select auth.uid()));
create policy "hosts read own settlements" on public.settlements for select to authenticated using (host_id = (select auth.uid()));

insert into public.insurance_plans (code, name, fee, coverage) values
  ('none', '보험 없음', 0, '{"description":"사고 시 전액 자기 부담"}'),
  ('basic', '기본 보험', 10000, '{"personal_injury":"100000000","property_damage":"20000000"}'),
  ('premium', '프리미엄', 25000, '{"personal_injury":"unlimited","property_damage":"50000000","own_damage":true}');
