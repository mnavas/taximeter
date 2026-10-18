-- 0010 — Geo RPCs used by the apps + the live fleet map.
-- (0009's default privileges grant EXECUTE on these to the Supabase roles.)

-- Driver app: upsert the taxi's latest position + duty flags.
create or replace function public.update_position(
  p_taxi      uuid,
  p_lat       double precision,
  p_lng       double precision,
  p_heading   numeric default null,
  p_speed     numeric default null,
  p_on_duty   boolean default true,
  p_available boolean default true
) returns void language sql as $$
  insert into taxi_position (taxi_id, geog, heading, speed, on_duty, available, updated_at)
  values (p_taxi, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
          p_heading, p_speed, p_on_duty, p_available, now())
  on conflict (taxi_id) do update set
    geog       = excluded.geog,
    heading    = excluded.heading,
    speed      = excluded.speed,
    on_duty    = excluded.on_duty,
    available  = excluded.available,
    updated_at = now();
$$;

-- Passenger app: counts only (privacy) — taxis near a point, and available ones.
-- Uses the company's availability radius; ignores stale positions (> 2 min).
create or replace function public.availability(p_lat double precision, p_lng double precision)
returns table(near bigint, available bigint) language sql stable as $$
  select
    count(*) filter (where tp.on_duty),
    count(*) filter (where tp.on_duty and tp.available)
  from taxi_position tp
  cross join (select coalesce(max(availability_radius_m), 3000) as r from company) c
  where tp.updated_at > now() - interval '2 minutes'
    and ST_DWithin(tp.geog, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, c.r);
$$;

-- Dashboard: on-duty taxis with lat/lng for the live map.
create or replace function public.fleet_positions()
returns table(
  taxi_id uuid, plate text, lat double precision, lng double precision,
  heading numeric, speed numeric, available boolean, updated_at timestamptz
) language sql stable as $$
  select tp.taxi_id, t.plate,
         ST_Y(tp.geog::geometry), ST_X(tp.geog::geometry),
         tp.heading, tp.speed, tp.available, tp.updated_at
  from taxi_position tp
  join taxi t on t.id = tp.taxi_id
  where tp.on_duty;
$$;
