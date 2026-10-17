-- 0003 — Fare engine: tiers, per-tier parameters, time rules (admin-owned)

create table fare_tier (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table fare_parameter (
  id        uuid primary key default gen_random_uuid(),
  tier_id   uuid not null references fare_tier(id) on delete cascade,
  key       text not null check (key in (
              'flagfall', 'per_km', 'per_min_wait',
              'night_surcharge', 'booking_fee', 'minimum_fare')),
  amount    numeric not null default 0,
  unit      text,
  unique (tier_id, key)
);

-- Time-of-day / day-of-week rules: availability windows or surcharge windows.
create table tier_time_rule (
  id            uuid primary key default gen_random_uuid(),
  tier_id       uuid not null references fare_tier(id) on delete cascade,
  applies       text not null check (applies in ('availability', 'surcharge')),
  days_of_week  integer[] not null default '{0,1,2,3,4,5,6}',  -- 0=Sunday
  start_time    time not null,
  end_time      time not null,
  effect        text,     -- 'available' | surcharge key/multiplier descriptor
  created_at    timestamptz not null default now()
);
