# Administration & Maintenance

Backups, updates, email (SMTP), troubleshooting, and the full CLI reference.

---

## The `./taximeter` CLI

All management runs through one command (`taximeter` on Windows):

```
./taximeter install      First-time setup (server URL, company, admin)
./taximeter start        Start all containers
./taximeter stop         Stop all containers
./taximeter restart      Restart all containers
./taximeter update       Pull the latest version, rebuild, and restart
./taximeter logs         Live logs (Ctrl+C to stop) — e.g. ./taximeter logs taximeter
./taximeter status       Show container status
./taximeter seed         Insert/update the company row from .env
./taximeter storage-setup Configure the media storage bucket + policies (idempotent)
./taximeter add-admin    Create a dashboard admin (email + password)
./taximeter backup       Dump the database to backups/
./taximeter restore      Restore a backup: ./taximeter restore backups/file.sql
./taximeter hostname     List the URLs the server is reachable at
./taximeter keys         Show the generated secrets (truncated)
./taximeter help         Show all commands
```

---

## Ports

| Port | Service | Access |
|---|---|---|
| 3000 | Taximeter dashboard | Admin (and the apps hit the API) |
| 3001 | Supabase Studio | Database admin UI — keep private |
| 8000 | Supabase API (Kong) | Used by the dashboard and the apps |

Expose 3000 (and your API) to the internet for the apps to reach; keep 3001 private.

---

## Backups

```bash
./taximeter backup
```

Writes a timestamped SQL dump to `backups/taximeter_db_<timestamp>.sql`. Copy these somewhere safe
(another disk, object storage). Back up before every update.

Restore:

```bash
./taximeter restore backups/taximeter_db_20260101_120000.sql
./taximeter restart
```

Restore **overwrites** the current database — you'll be asked to confirm.

---

## Updating

```bash
./taximeter update
```

This pulls the latest version (`git pull origin main`), rebuilds the app image, and restarts.
**Back up first.** Database schema changes apply automatically on a fresh database; for existing
installs, review release notes before updating.

---

## Admin accounts

Create another dashboard admin:

```bash
./taximeter add-admin
```

Admin logins are managed by the auth service (GoTrue). On an accounts-off install, no email server
is needed — admins are created directly.

---

## Email (SMTP) — only if you enable passenger accounts

Passenger accounts are **email-verified**. If you turn on optional or required passenger accounts,
GoTrue needs an SMTP sender to send verification emails. Set these in `.env` and restart:

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_SENDER_NAME=YourCompany
SMTP_ADMIN_EMAIL=you@yourcompany.com
```

Anonymous-only installs need no SMTP at all.

---

## Moderating passenger marks

Drivers can flag passengers (non-payment, no-show, abuse). From the dashboard you can **review and
clear** marks so the flag system can't be abused. Cleared marks are kept for audit, never deleted.

---

## Security

- All secrets (`POSTGRES_PASSWORD`, `JWT_SECRET`, Supabase keys) are generated at install into
  `.env`. **Keep `.env` private** and never commit it — it's git-ignored.
- `docker/kong.yml` is generated from the template with your real keys and is also git-ignored.
- Put the server behind HTTPS (a reverse proxy such as Caddy or Nginx with a certificate) for
  production; phones should pair over `https://`.
- Keep Supabase Studio (port 3001) off the public internet.

---

## Troubleshooting

**A service keeps restarting.** Check its logs:
```bash
./taximeter logs auth
./taximeter logs rest
./taximeter logs db
```

**`password authentication failed` for `supabase_auth_admin` / `authenticator`.** The service roles
weren't created — the database was initialised before the role bootstrap ran. On a fresh install
this is handled automatically; if you hit it, you have stale data: back up anything you need, then
reset the database volume and reinstall:
```bash
docker compose down -v
./taximeter install
```
⚠️ `down -v` **erases the database** — only do this on an install with no data you need.

**`realtime` keeps restarting on `ulimit`.** The container needs a higher open-file limit; this is
set in `docker-compose.yml` (`ulimits: nofile`). Ensure your Docker daemon allows it.

**Studio shows "unhealthy".** Cosmetic — Studio's healthcheck expects a `pg-meta` service that
isn't part of this stack. Studio still works.

**Can't reach the dashboard from a phone.** The server URL in the pairing QR must be reachable from
mobile data, not just your LAN. Use a public address or domain, and open the port / set up your
reverse proxy.

**Check everything is up:**
```bash
./taximeter status
```

---

## Where things live

| Path | What |
|---|---|
| `.env` | All configuration and secrets (git-ignored) |
| `docker/kong.yml` | Generated gateway config (git-ignored) |
| `supabase/migrations/` | Database schema, run in order on a fresh DB |
| `backups/` | Your database dumps |
