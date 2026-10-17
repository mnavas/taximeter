-- 0004 — Operational: positions, requests, trips, route points, reviews, marks

-- Latest known position per taxi (the live map + availability counts read this).
create table taxi_position (
  taxi_id     uuid primary key references taxi(id) on delete cascade,
  geog        geography(Point, 4326) not null,
  heading     numeric,
  speed       numeric,                      -- km/h
  on_duty     boolean not null default false,
  available   boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- Ride request (solicitud) from a passenger.
create table ride_request (
  id                     uuid primary key default gen_random_uuid(),
  passenger_id           uuid references passenger(id) on delete set null,
  pickup_geog            geography(Point, 4326) not null,
  dropoff_geog           geography(Point, 4326),
  desired_tier_id        uuid references fare_tier(id) on delete set null,
  status                 text not null default 'pending'
                           check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  verification_code      text,
  accepted_by_driver_id  uuid references driver(id) on delete set null,
  created_at             timestamptz not null default now(),
  expires_at             timestamptz
);

-- A trip. Stores the applied tier + a fare snapshot so history is auditable.
create table trip (
  id                 uuid primary key default gen_random_uuid(),
  request_id         uuid references ride_request(id) on delete set null,
  driver_id          uuid references driver(id) on delete set null,
  taxi_id            uuid references taxi(id) on delete set null,
  passenger_id       uuid references passenger(id) on delete set null,
  tier_id            uuid references fare_tier(id) on delete set null,   -- tier actually applied
  started_at         timestamptz,
  ended_at           timestamptz,
  distance_m         numeric not null default 0,
  duration_s         integer not null default 0,
  wait_s             integer not null default 0,
  fare_total         numeric not null default 0,
  fare_breakdown     jsonb,
  fare_snapshot      jsonb,                    -- tier parameters at trip time
  code_verified      boolean not null default false,
  -- Settlement
  payment_method     text check (payment_method in ('cash', 'qr')),
  settlement_status  text not null default 'unpaid'
                       check (settlement_status in ('unpaid', 'pending', 'settled')),
  payment_proof      text,                     -- storage ref to shared receipt (qr)
  payment_ref        text,                     -- transaction id/text if captured
  paid_at            timestamptz,
  status             text not null default 'active'
                       check (status in ('active', 'completed', 'cancelled')),
  created_at         timestamptz not null default now()
);

-- Ordered polyline of a trip (append-only).
create table route_point (
  id       bigserial primary key,
  trip_id  uuid not null references trip(id) on delete cascade,
  seq      integer not null,
  geog     geography(Point, 4326) not null,
  speed    numeric,
  at       timestamptz not null default now()
);

-- Mutual ratings/reviews.
create table review (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references trip(id) on delete set null,
  author      text not null check (author in ('passenger', 'driver')),
  subject     text not null check (subject in ('driver', 'passenger')),
  rating      smallint check (rating between 1 and 5),
  text        text,
  created_at  timestamptz not null default now()
);

-- Passenger flags (non-payment, no-show, abuse). Identifiers captured so a mark
-- follows repeat offenders across new/anonymous accounts. Admin-moderated.
create table mark (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid references trip(id) on delete set null,
  author        text not null check (author in ('driver', 'admin')),
  reason        text not null check (reason in ('non_payment', 'no_show', 'abuse', 'other')),
  note          text,
  status        text not null default 'active' check (status in ('active', 'cleared')),
  passenger_id  uuid references passenger(id) on delete set null,
  device_id     uuid references device(id) on delete set null,
  email         text,
  created_at    timestamptz not null default now(),
  cleared_by    uuid,
  cleared_at    timestamptz
);
