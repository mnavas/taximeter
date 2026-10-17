-- 0002 — Core entities: company (single row), driver, taxi, passenger, device
-- Single-tenant: the whole database is one company.

create table company (
  id                             uuid primary key default gen_random_uuid(),
  only_one                       boolean not null default true unique check (only_one),
  name                           text not null,
  logo_url                       text,
  timezone                       text not null default 'America/Guayaquil',
  contact                        text,
  pairing_secret                 text not null default encode(gen_random_bytes(16), 'hex'),
  -- Fleet / dispatch
  availability_radius_m          integer not null default 3000,
  request_timeout_s              integer not null default 60,
  -- Fares
  wait_time_billing              boolean not null default false,
  wait_speed_threshold           numeric not null default 10,     -- km/h
  -- Payments
  payment_qr_scope               text not null default 'per_driver'
                                   check (payment_qr_scope in ('per_driver', 'company')),
  payment_fraud_check            boolean not null default false,
  company_payment_qr_url         text,
  company_payment_account_label  text,
  -- Passenger accounts
  require_passenger_accounts     boolean not null default false,
  created_at                     timestamptz not null default now()
);

create table driver (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  photo_url              text,
  licence_no             text,
  phone                  text,
  payment_qr_url         text,              -- used when company.payment_qr_scope = 'per_driver'
  payment_account_label  text,
  status                 text not null default 'active' check (status in ('active', 'suspended')),
  auth_user_id           uuid,              -- optional web login (GoTrue), no FK by design
  created_at             timestamptz not null default now()
);

create table taxi (
  id                 uuid primary key default gen_random_uuid(),
  plate              text not null,
  make               text,
  model              text,
  color              text,
  photo_url          text,
  allowed_tiers      uuid[] not null default '{}',   -- fare_tier ids this vehicle may serve
  status             text not null default 'active' check (status in ('active', 'suspended')),
  current_driver_id  uuid references driver(id) on delete set null,
  created_at         timestamptz not null default now()
);

create table passenger (
  id                 uuid primary key default gen_random_uuid(),
  kind               text not null default 'anonymous' check (kind in ('anonymous', 'registered')),
  name               text,
  email              text,
  email_verified_at  timestamptz,
  auth_user_id       uuid,              -- GoTrue user for registered passengers, no FK by design
  rating_avg         numeric,           -- cached from reviews
  rides_completed    integer not null default 0,
  created_at         timestamptz not null default now()
);

-- A paired phone (driver or passenger). Created at QR pairing; token stored hashed.
create table device (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('driver', 'passenger')),
  driver_id     uuid references driver(id) on delete cascade,
  passenger_id  uuid references passenger(id) on delete cascade,
  taxi_id       uuid references taxi(id) on delete set null,
  token_hash    text not null,
  paired_at     timestamptz not null default now(),
  last_seen_at  timestamptz,
  revoked       boolean not null default false
);
