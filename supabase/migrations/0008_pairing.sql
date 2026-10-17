-- 0008 — Device pairing codes
-- One-time codes the dashboard generates for a driver/taxi. The driver app
-- exchanges a code (via POST /api/pair) for a long-lived device token.

create table pairing_code (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  taxi_id         uuid references taxi(id) on delete cascade,
  driver_id       uuid references driver(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '15 minutes'),
  used_at         timestamptz,
  used_by_device  uuid references device(id) on delete set null
);

create index idx_pairing_code_open on pairing_code (code) where used_at is null;

alter table pairing_code enable row level security;
create policy admin_all on pairing_code for all to authenticated using (true) with check (true);
