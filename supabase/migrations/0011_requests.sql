-- 0011 — Ride requests & dispatch: pickup-ETA columns + the dispatch RPCs.

alter table ride_request
  add column if not exists accepted_at       timestamptz,
  add column if not exists eta_declared_min  integer,
  add column if not exists pickup_distance_m numeric,
  add column if not exists picked_up_at      timestamptz;

-- Passenger creates a request (pickup point + optional desired tier + a code).
create or replace function public.create_request(
  p_passenger uuid, p_lat double precision, p_lng double precision,
  p_tier uuid, p_code text, p_timeout integer
) returns table(id uuid, expires_at timestamptz) language sql as $$
  insert into ride_request (passenger_id, pickup_geog, desired_tier_id, verification_code, expires_at)
  values (p_passenger,
          ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
          p_tier, p_code, now() + make_interval(secs => p_timeout))
  returning id, expires_at;
$$;

-- Driver sees eligible pending requests (in range of their taxi, tier-compatible).
create or replace function public.eligible_requests(p_taxi uuid)
returns table(
  id uuid, pickup_lat double precision, pickup_lng double precision,
  distance_m double precision, desired_tier text, created_at timestamptz
) language sql stable as $$
  select rr.id,
         ST_Y(rr.pickup_geog::geometry), ST_X(rr.pickup_geog::geometry),
         ST_Distance(rr.pickup_geog, tp.geog), ft.name, rr.created_at
  from ride_request rr
  cross join (select coalesce(max(availability_radius_m), 3000) as r from company) c
  join taxi t on t.id = p_taxi
  left join taxi_position tp on tp.taxi_id = p_taxi
  left join fare_tier ft on ft.id = rr.desired_tier_id
  where rr.status = 'pending'
    and (rr.expires_at is null or rr.expires_at > now())
    and (rr.desired_tier_id is null or rr.desired_tier_id = any(t.allowed_tiers))
    and (tp.geog is null or ST_DWithin(rr.pickup_geog, tp.geog, c.r))
  order by 4 nulls last
  limit 20;
$$;

-- Driver accepts with a declared pickup ETA. Atomic first-to-accept.
create or replace function public.accept_request(
  p_request uuid, p_driver uuid, p_taxi uuid, p_eta_min integer
) returns table(won boolean, passenger_id uuid) language plpgsql as $$
declare v_dist numeric; v_pax uuid; v_rows integer;
begin
  select ST_Distance(rr.pickup_geog, tp.geog) into v_dist
    from ride_request rr left join taxi_position tp on tp.taxi_id = p_taxi
    where rr.id = p_request;

  update ride_request
     set status = 'accepted', accepted_by_driver_id = p_driver, accepted_at = now(),
         eta_declared_min = p_eta_min, pickup_distance_m = v_dist
   where id = p_request and status = 'pending'
     and (expires_at is null or expires_at > now())
   returning ride_request.passenger_id into v_pax;
  get diagnostics v_rows = row_count;

  if v_rows = 1 then
    insert into trip (request_id, driver_id, taxi_id, passenger_id, status)
      values (p_request, p_driver, p_taxi, v_pax, 'active');
    update taxi_position set available = false where taxi_id = p_taxi;
    return query select true, v_pax;
  else
    return query select false, null::uuid;
  end if;
end $$;

-- Passenger polls their request; after acceptance, the assigned taxi's details.
create or replace function public.request_status(p_request uuid)
returns table(
  status text, eta_declared_min integer, pickup_distance_m numeric, verification_code text,
  driver_name text, driver_photo text, plate text, car text, passenger_id uuid
) language sql stable as $$
  select rr.status, rr.eta_declared_min, rr.pickup_distance_m, rr.verification_code,
         d.name, d.photo_url, t.plate,
         nullif(trim(concat_ws(' ', t.make, t.model, t.color)), ''),
         rr.passenger_id
  from ride_request rr
  left join driver d on d.id = rr.accepted_by_driver_id
  left join trip tp on tp.request_id = rr.id
  left join taxi t on t.id = tp.taxi_id
  where rr.id = p_request;
$$;
