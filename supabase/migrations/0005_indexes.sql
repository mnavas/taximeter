-- 0005 — Indexes (geo GiST + hot lookups)

create index idx_taxi_position_geog        on taxi_position using gist (geog);
create index idx_ride_request_pickup_geog  on ride_request  using gist (pickup_geog);
create index idx_route_point_geog          on route_point   using gist (geog);

create index idx_route_point_trip   on route_point  (trip_id, seq);
create index idx_ride_request_status on ride_request (status);
create index idx_trip_driver        on trip (driver_id);
create index idx_trip_status        on trip (status);
create index idx_taxi_driver        on taxi (current_driver_id);
create index idx_device_driver      on device (driver_id);
create index idx_device_passenger   on device (passenger_id);

-- Mark lookups by any identifier (used to build a passenger trust summary).
create index idx_mark_passenger on mark (passenger_id) where status = 'active';
create index idx_mark_device    on mark (device_id)    where status = 'active';
create index idx_mark_email     on mark (lower(email)) where status = 'active';
