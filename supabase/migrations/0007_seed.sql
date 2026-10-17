-- 0007 — Seed example fare tiers + parameters so the dashboard has data.
-- The company row itself is seeded from .env by `./taximeter install` / `seed`.

insert into fare_tier (name, sort_order, description) values
  ('Economy', 1, 'Standard sedan'),
  ('SUV',     2, 'Larger vehicle');

-- Example amounts (USD) — the company edits these in the dashboard.
insert into fare_parameter (tier_id, key, amount, unit)
select id, 'flagfall',     0.50, 'usd'    from fare_tier where name = 'Economy'
union all select id, 'per_km',       0.45, 'usd/km' from fare_tier where name = 'Economy'
union all select id, 'per_min_wait', 0.10, 'usd/min' from fare_tier where name = 'Economy'
union all select id, 'minimum_fare', 1.50, 'usd'    from fare_tier where name = 'Economy'
union all select id, 'booking_fee',  0.25, 'usd'    from fare_tier where name = 'Economy'
union all select id, 'flagfall',     1.00, 'usd'    from fare_tier where name = 'SUV'
union all select id, 'per_km',       0.70, 'usd/km' from fare_tier where name = 'SUV'
union all select id, 'per_min_wait', 0.15, 'usd/min' from fare_tier where name = 'SUV'
union all select id, 'minimum_fare', 2.50, 'usd'    from fare_tier where name = 'SUV'
union all select id, 'booking_fee',  0.50, 'usd'    from fare_tier where name = 'SUV';
