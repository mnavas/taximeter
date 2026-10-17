-- 0006 — Row-Level Security
--
-- v0.0.0 policy: enable RLS everywhere; grant the logged-in admin (role
-- `authenticated`) full access. `service_role` bypasses RLS (server-side use).
-- `anon` has no table access by default.
--
-- TODO (v0.1): device-token-scoped policies — a driver device may write only its
-- own taxi's positions/trips; a passenger device may read availability and its own
-- request only. Prototype before committing (see docs/v0.0.0/analysis.md R2).

do $$
declare t text;
begin
  foreach t in array array[
    'company','driver','taxi','passenger','device',
    'fare_tier','fare_parameter','tier_time_rule',
    'taxi_position','ride_request','trip','route_point','review','mark'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy admin_all on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
