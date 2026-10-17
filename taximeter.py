#!/usr/bin/env python3
"""Taximeter CLI — install, start, stop, update, and manage your company server."""

import base64
import getpass
import hashlib
import hmac
import json
import os
import platform
import re
import secrets
import socket
import subprocess
import sys
import time
from pathlib import Path

# ── Platform ──────────────────────────────────────────────────────────────────

def _cmd():
    return "taximeter" if platform.system() == "Windows" else "./taximeter"

# ── Colors ────────────────────────────────────────────────────────────────────

def _supports_color():
    if platform.system() == "Windows":
        try:
            import ctypes
            ctypes.windll.kernel32.SetConsoleMode(
                ctypes.windll.kernel32.GetStdHandle(-11), 7)
            return True
        except Exception:
            return False
    return sys.stdout.isatty()

_COLOR = _supports_color()

def _c(text, code): return f"\033[{code}m{text}\033[0m" if _COLOR else text
def green(t):  return _c(t, "32")
def yellow(t): return _c(t, "33")
def red(t):    return _c(t, "31")
def cyan(t):   return _c(t, "36")
def bold(t):   return _c(t, "1")
def dim(t):    return _c(t, "2")

def ok(msg):      print(green("✓ ") + msg)
def warn(msg):    print(yellow("⚠ ") + msg)
def err(msg):     print(red("✗ ") + msg)
def info(msg):    print(cyan("→ ") + msg)
def step(n, msg): print(f"\n{bold(str(n) + '.')} {msg}")

# ── Helpers ───────────────────────────────────────────────────────────────────

HERE = Path(__file__).parent.resolve()

def run(cmd, check=True):
    subprocess.run(cmd, shell=True, check=check, cwd=HERE)

def run_ok(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, cwd=HERE)
    return r.returncode == 0

def ask(prompt, default=None):
    suffix = f" [{default}]" if default else ""
    val = input(f"  {prompt}{suffix}: ").strip()
    return val or default or ""

def ask_password(prompt="Password (min 6 chars)"):
    while True:
        pw = getpass.getpass(f"  {prompt}: ")
        if len(pw) < 6:
            print(f"  {red('Password must be at least 6 characters — try again.')}")
            continue
        pw2 = getpass.getpass(f"  Confirm password: ")
        if pw == pw2:
            return pw
        print(f"  {red('Passwords do not match — try again.')}")

def ask_email(prompt="Admin email"):
    while True:
        email = ask(prompt).strip()
        if re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            return email
        print(f"  {red('That does not look like a valid email — try again.')}")

def ask_yes(prompt, default=True):
    suffix = "[Y/n]" if default else "[y/N]"
    val = input(f"  {prompt} {suffix} ").strip().lower()
    return (val in ("y", "yes")) if val else default

def pick(prompt, options):
    print(f"\n  {prompt}")
    for i, label in enumerate(options):
        print(f"  {bold(str(i + 1) + '.')} {label}")
    print()
    while True:
        raw = input(f"  Enter number (1–{len(options)}): ").strip()
        try:
            n = int(raw)
            if 1 <= n <= len(options):
                return n - 1
        except ValueError:
            pass
        print(f"  Please enter a number between 1 and {len(options)}.")

# ── JWT generation (pure Python — no Node.js needed on host) ─────────────────

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def _make_jwt(payload: dict, secret: str) -> str:
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body   = _b64url(json.dumps(payload, separators=(",", ":")).encode())
    signing_input = f"{header}.{body}"
    sig = _b64url(
        hmac.new(secret.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    )
    return f"{signing_input}.{sig}"

def generate_supabase_keys(jwt_secret: str):
    iat = int(time.time())
    exp = iat + 5 * 365 * 24 * 60 * 60
    anon_key    = _make_jwt({"role": "anon",         "iss": "supabase-demo", "iat": iat, "exp": exp}, jwt_secret)
    service_key = _make_jwt({"role": "service_role", "iss": "supabase-demo", "iat": iat, "exp": exp}, jwt_secret)
    return anon_key, service_key

# ── Docker ────────────────────────────────────────────────────────────────────

def ensure_docker():
    if not run_ok("docker --version"):
        err("Docker is not installed.")
        if platform.system() == "Linux":
            if ask_yes("Install Docker now?"):
                info("Running the official Docker install script…")
                run("curl -fsSL https://get.docker.com | sh")
                user = os.environ.get("USER", "")
                if user:
                    run(f"sudo usermod -aG docker {user}", check=False)
                ok("Docker installed.")
                print("  " + dim(f"You may need to log out and back in, then run: {_cmd()} install"))
                sys.exit(0)
        else:
            print(f"  Download Docker Desktop: {cyan('https://www.docker.com/products/docker-desktop/')}")
        sys.exit(1)

    if not run_ok("docker info"):
        err("Docker is installed but not running.")
        if platform.system() == "Linux":
            if ask_yes("Start Docker now?"):
                run("sudo systemctl start docker", check=False)
                time.sleep(2)
                if not run_ok("docker info"):
                    err("Could not start Docker. Try: sudo systemctl start docker")
                    sys.exit(1)
                ok("Docker started.")
                return
        else:
            print("  Please open Docker Desktop and wait for it to start, then try again.")
        sys.exit(1)

    if not run_ok("docker compose version"):
        err("Docker Compose plugin not found. Please update Docker Desktop.")
        sys.exit(1)

    ok("Docker is ready.")

# ── Git ───────────────────────────────────────────────────────────────────────

def ensure_git():
    if run_ok("git --version"):
        ok("Git is ready.")
        return
    err("Git is not installed.")
    print(f"  Install Git from: {cyan('https://git-scm.com/downloads')}")
    sys.exit(1)

# ── Network ───────────────────────────────────────────────────────────────────

def get_local_ips():
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        s.connect(("10.254.254.254", 1))
        ips.add(s.getsockname()[0])
        s.close()
    except Exception:
        pass
    try:
        for info_t in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info_t[4][0])
    except Exception:
        pass
    ips.discard("127.0.0.1")
    return sorted(ips)

# ── .env helpers ──────────────────────────────────────────────────────────────

def _env_file():
    return HERE / ".env"

def _check_installed():
    if not _env_file().exists():
        err("Taximeter is not set up yet.")
        print("  Run " + bold(f"{_cmd()} install") + " first.")
        sys.exit(1)

def _print_urls(app_url=None):
    if app_url:
        base = app_url
        print("  Dashboard: " + bold(cyan(base + "/dashboard")))
        print("  Studio:    " + cyan(base.replace(":3000", ":3001")) + dim("  (admin only — keep private)"))
        return
    ips = get_local_ips()
    if ips:
        base = f"http://{ips[0]}:3000"
        print("  Dashboard: " + bold(cyan(base + "/dashboard")))
        print("  Studio:    " + cyan(f"http://{ips[0]}:3001"))

def _read_env_value(key: str) -> str:
    env = _env_file()
    if not env.exists():
        return ""
    # Last match wins, matching docker-compose's handling of duplicate keys.
    val = ""
    for line in env.read_text().splitlines():
        if line.startswith(f"{key}="):
            val = line[len(key) + 1:].strip()
    return val

def _sql_str(val: str) -> str:
    if not val:
        return "NULL"
    return "'" + val.replace("'", "''") + "'"

def _sql_bool(val: str) -> str:
    return "true" if str(val).strip().lower() in ("on", "true", "yes", "1") else "false"

def _sql_num(val: str, default: str) -> str:
    try:
        float(val)
        return val
    except (TypeError, ValueError):
        return default

# ── Commands ──────────────────────────────────────────────────────────────────

def _wait_for_supabase(max_wait=120):
    import urllib.request
    app_url = _read_env_value("NEXT_PUBLIC_SUPABASE_URL") or "http://localhost:8000"
    health_url = f"{app_url}/auth/v1/health"
    info("Waiting for Supabase to be ready…")
    for _ in range(max_wait // 3):
        try:
            urllib.request.urlopen(health_url, timeout=2)
            ok("Supabase is ready.")
            return
        except Exception:
            time.sleep(3)
    warn("Supabase did not become ready in time. You may need to run seed/add-admin manually.")


def _company_seed_sql() -> str:
    """INSERT the single company row from .env (idempotent)."""
    name     = _read_env_value("COMPANY_NAME") or "My Taxi Company"
    tz       = _read_env_value("COMPANY_TIMEZONE") or "America/Guayaquil"
    contact  = _read_env_value("COMPANY_CONTACT")
    radius   = _sql_num(_read_env_value("AVAILABILITY_RADIUS_M"), "3000")
    timeout  = _sql_num(_read_env_value("REQUEST_TIMEOUT_S"), "60")
    wait_on  = _sql_bool(_read_env_value("WAIT_TIME_BILLING"))
    wait_thr = _sql_num(_read_env_value("WAIT_SPEED_THRESHOLD"), "10")
    qr_scope = _read_env_value("PAYMENT_QR_SCOPE") or "per_driver"
    fraud    = _sql_bool(_read_env_value("PAYMENT_FRAUD_CHECK"))
    req_acct = _sql_bool(_read_env_value("REQUIRE_PASSENGER_ACCOUNTS"))
    return (
        "INSERT INTO company ("
        "  name, timezone, contact, availability_radius_m, request_timeout_s,"
        "  wait_time_billing, wait_speed_threshold, payment_qr_scope,"
        "  payment_fraud_check, require_passenger_accounts"
        ") VALUES ("
        f"  {_sql_str(name)}, {_sql_str(tz)}, {_sql_str(contact)}, {radius}, {timeout},"
        f"  {wait_on}, {wait_thr}, {_sql_str(qr_scope)}, {fraud}, {req_acct}"
        ") ON CONFLICT (only_one) DO NOTHING;"
    )


def _psql(sql: str, check=True):
    subprocess.run(
        "docker compose exec -T db bash -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U postgres -d postgres'",
        input=sql.encode(), shell=True, check=check, cwd=HERE,
    )


def cmd_seed():
    _check_installed()
    name = _read_env_value("COMPANY_NAME")
    if not name:
        warn("COMPANY_NAME not set in .env — seeding with a default name.")
    _psql(_company_seed_sql())
    ok(f"Company row seeded: {bold(name or 'My Taxi Company')}")


def _create_admin(email, password, service_key, supa_url):
    import urllib.request, urllib.error
    api_url = f"{supa_url}/auth/v1/admin/users"
    payload = json.dumps({"email": email, "password": password, "email_confirm": True}).encode()
    req = urllib.request.Request(
        api_url, data=payload,
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {service_key}",
                 "apikey": service_key},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def cmd_add_admin():
    _check_installed()
    print()
    print(bold("Add a dashboard admin account"))
    print()
    email    = ask_email()
    password = ask_password()
    service_key = _read_env_value("SERVICE_ROLE_KEY") or _read_env_value("SUPABASE_SERVICE_ROLE_KEY")
    supa_url    = _read_env_value("NEXT_PUBLIC_SUPABASE_URL") or "http://localhost:8000"
    try:
        data = _create_admin(email, password, service_key, supa_url)
        ok(f"Admin account created: {bold(email)}  (id: {data.get('id', '?')})")
    except Exception as e:
        err(f"Could not create admin account: {e}")
        sys.exit(1)


def cmd_install():
    print(f"\n{bold('Taximeter — Installation')}\n")

    env_file = _env_file()
    if env_file.exists():
        ok("Taximeter is already installed.")
        print("  Run " + bold(f"{_cmd()} start") + "   to start the server.")
        print("  Run " + bold(f"{_cmd()} status") + "  to check containers.")
        return

    step(1, "Checking Docker…")
    ensure_docker()

    env_example = HERE / ".env.example"
    if not env_example.exists():
        err(".env.example not found. Make sure you're in the Taximeter folder.")
        sys.exit(1)

    step(2, "Server URL")
    print(f"  {dim('The address drivers and passengers reach this server on.')}")
    ips = get_local_ips()
    url_options = [f"http://{ip}:3000" for ip in ips] + ["http://localhost:3000", "Enter manually"]
    idx = pick("Select the server URL:", url_options)
    if url_options[idx] == "Enter manually":
        app_url = ask("Server URL").rstrip("/")
    else:
        app_url = url_options[idx]
        ok(f"Using: {cyan(app_url)}")

    print()
    step(3, "Company name")
    company_name = ask("Taxi company name", default="My Taxi Company")

    print()
    step(4, "Admin account")
    print(f"  {dim('The login for the Taximeter dashboard.')}")
    print()
    admin_email    = ask_email()
    admin_password = ask_password()

    print()
    step(5, "Generating secrets…")
    postgres_password = secrets.token_urlsafe(20)
    jwt_secret        = secrets.token_hex(32)
    internal_secret   = secrets.token_urlsafe(20)
    anon_key, service_key = generate_supabase_keys(jwt_secret)
    ok("Secrets generated (Postgres password, JWT secret, Supabase keys).")

    env_content = (
        env_example.read_text()
        .replace("change-me-strong-password", postgres_password)
        .replace("change-me-at-least-32-chars-random-string", jwt_secret)
        .replace("change-me-random-string", internal_secret)
        .replace("${ANON_KEY}",         anon_key)
        .replace("${SERVICE_ROLE_KEY}", service_key)
        .replace("\nANON_KEY=",         f"\nANON_KEY={anon_key}")
        .replace("\nSERVICE_ROLE_KEY=", f"\nSERVICE_ROLE_KEY={service_key}")
        .replace("http://localhost:3000", app_url)
        .replace("http://localhost:8000", app_url.replace(":3000", ":8000"))
        # Fill the empty placeholders in-place (don't append duplicate keys).
        .replace("\nCOMPANY_NAME=\n", f"\nCOMPANY_NAME={company_name}\n")
        .replace("\nADMIN_EMAIL=\n", f"\nADMIN_EMAIL={admin_email}\n")
    )
    env_file.write_text(env_content)
    ok(".env saved.")

    kong_template = HERE / "docker" / "kong.yml.template"
    kong_out      = HERE / "docker" / "kong.yml"
    if kong_template.exists():
        kong_out.write_text(
            kong_template.read_text()
            .replace("${SUPABASE_ANON_KEY}",   anon_key)
            .replace("${SUPABASE_SERVICE_KEY}", service_key)
        )
        ok("docker/kong.yml written.")

    step(6, "Building and starting Taximeter…")
    print(f"  {dim('First run downloads images and builds the app — a few minutes.')}")
    run("docker compose up -d --build")

    step(7, "Initializing database…")
    _wait_for_supabase()
    db_ok = True
    try:
        _psql(_company_seed_sql())
        ok("Database initialized (company row seeded).")
    except Exception as e:
        db_ok = False
        warn(f"DB init failed: {e}. Run {bold(_cmd() + ' seed')} later.")

    step(8, "Creating admin account…")
    admin_ok = True
    try:
        supa_url = app_url.replace(":3000", ":8000") if ":3000" in app_url else "http://localhost:8000"
        _create_admin(admin_email, admin_password, service_key, supa_url)
        ok(f"Admin account created: {bold(admin_email)}")
    except Exception as e:
        admin_ok = False
        warn(f"Could not create admin account: {e}")

    print()
    print("─" * 56)
    ok(bold("Taximeter is running!"))
    print()
    _print_urls(app_url)
    print()
    if not admin_ok:
        warn(bold("The admin account was NOT created."))
        print(f"  Run {bold(_cmd() + ' add-admin')} to create it, then log in.")
        print()
    if not db_ok:
        warn(bold("The database was NOT initialized."))
        print(f"  Run {bold(_cmd() + ' seed')} to initialize it.")
        print()
    print(f"  Run {bold(_cmd() + ' help')} to see all available commands.")
    print()


def cmd_start():
    _check_installed()
    info("Starting Taximeter…")
    run("docker compose up -d")
    print()
    ok(bold("Taximeter started."))
    print()
    _print_urls(_read_env_value("NEXT_PUBLIC_APP_URL"))
    print()


def cmd_stop():
    info("Stopping Taximeter…")
    run("docker compose down")
    ok("Taximeter stopped.")


def cmd_restart():
    _check_installed()
    info("Restarting Taximeter…")
    run("docker compose restart")
    ok(bold("Taximeter restarted."))
    _print_urls(_read_env_value("NEXT_PUBLIC_APP_URL"))


def cmd_logs():
    svc = sys.argv[2] if len(sys.argv) > 2 else ""
    run(f"docker compose logs -f {svc}".strip(), check=False)


def cmd_status():
    run("docker compose ps")


def cmd_update():
    print(f"\n{bold('Taximeter — Update')}\n")
    step(1, "Checking Git…")
    ensure_git()
    step(2, "Pulling latest version…")
    run("git pull origin main")
    step(3, "Rebuilding app image…")
    run("docker compose build taximeter")
    step(4, "Restarting…")
    run("docker compose up -d")
    print()
    ok(bold("Taximeter updated and restarted."))
    _print_urls(_read_env_value("NEXT_PUBLIC_APP_URL"))


def cmd_hostname():
    ips = get_local_ips()
    print()
    if not ips:
        warn("No network addresses detected.")
        return
    print(bold("Taximeter is reachable at:"))
    print()
    for ip in ips:
        print("  Dashboard: " + cyan(f"http://{ip}:3000/dashboard"))
        print("  Studio:    " + cyan(f"http://{ip}:3001"))
        print()
    print(dim("  Studio is for administrators only — don't expose it publicly."))
    print()


def cmd_backup():
    _check_installed()
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    backup_dir = HERE / "backups"
    backup_dir.mkdir(exist_ok=True)
    out_file = backup_dir / f"taximeter_db_{timestamp}.sql"
    info(f"Backing up database to {dim(str(out_file))}…")
    run(
        f'docker compose exec -T db bash -c "PGPASSWORD=$POSTGRES_PASSWORD pg_dump -U postgres -d postgres" > "{out_file}"',
        check=False,
    )
    if out_file.exists() and out_file.stat().st_size > 0:
        ok(f"Backup saved: {bold(out_file.name)}")
    else:
        err("Backup failed or produced an empty file.")
        if out_file.exists():
            out_file.unlink()
        sys.exit(1)


def cmd_restore():
    if len(sys.argv) < 3:
        err("Usage: taximeter restore <backup-file.sql>")
        sys.exit(1)
    backup_path = Path(sys.argv[2])
    if not backup_path.exists():
        err(f"File not found: {backup_path}")
        sys.exit(1)
    _check_installed()
    warn(f"This will OVERWRITE the current database with: {bold(backup_path.name)}")
    if not ask_yes("Are you sure?", default=False):
        info("Restore cancelled.")
        return
    info("Restoring database…")
    run(f'docker compose exec -T db bash -c "PGPASSWORD=$POSTGRES_PASSWORD psql -U postgres -d postgres" < "{backup_path}"')
    ok("Database restored. Restart Taximeter to apply.")
    print("  " + bold(f"{_cmd()} restart"))


def cmd_keys():
    _check_installed()
    print()
    print(bold("Taximeter — current secrets"))
    print()
    for key in ("POSTGRES_PASSWORD", "JWT_SECRET", "INTERNAL_SECRET",
                "ANON_KEY", "SERVICE_ROLE_KEY"):
        val = _read_env_value(key)
        display = val[:24] + "…" if len(val) > 28 else val
        print(f"  {key:<30} {dim(display)}")
    print()
    print(dim("  Full values are in .env — keep that file private."))
    print()


def cmd_help():
    print(f"""
{bold('Taximeter')} — self-hosted taxi dispatch, metering & fleet monitoring

{bold('USAGE')}
  ./taximeter <command>        (Linux / Mac)
  taximeter <command>          (Windows)

{bold('COMMANDS')}
  {green('install')}      First-time setup: server URL, company name, admin account,
                 then builds and starts everything.
  {green('start')}        Start all containers
  {green('stop')}         Stop all containers
  {green('restart')}      Restart all containers
  {green('update')}       Pull the latest version, rebuild the app, and restart
  {green('logs')}         View live logs  (Ctrl+C to stop)
                 Optional: {dim('./taximeter logs taximeter')}  — app only
  {green('status')}       Show container status
  {green('seed')}         Insert/update the company row from .env values
  {green('add-admin')}    Create a dashboard admin account (email + password)
  {green('backup')}       Dump the database to backups/taximeter_db_<timestamp>.sql
  {green('restore')}      Restore a database backup: {dim('./taximeter restore backups/file.sql')}
  {green('hostname')}     List all URLs where Taximeter is reachable
  {green('keys')}         Show the generated secrets (truncated)
  {green('help')}         Show this message

{bold('PORTS')}
  3000  Taximeter dashboard
  3001  Supabase Studio (admin DB UI — keep private)
  8000  Supabase API (used by the apps)
""")


# ── Entry point ───────────────────────────────────────────────────────────────

COMMANDS = {
    "install":   cmd_install,
    "start":     cmd_start,
    "stop":      cmd_stop,
    "restart":   cmd_restart,
    "logs":      cmd_logs,
    "status":    cmd_status,
    "update":    cmd_update,
    "seed":      cmd_seed,
    "add-admin": cmd_add_admin,
    "hostname":  cmd_hostname,
    "backup":    cmd_backup,
    "restore":   cmd_restore,
    "keys":      cmd_keys,
    "help":      cmd_help,
    "-h":        cmd_help,
    "--help":    cmd_help,
}

def main():
    if len(sys.argv) < 2:
        cmd_help()
        sys.exit(0)
    cmd = sys.argv[1].lower()
    if cmd not in COMMANDS:
        err(f"Unknown command: {cmd}")
        print("  Run " + bold(f"{_cmd()} help") + " for available commands.")
        sys.exit(1)
    COMMANDS[cmd]()

if __name__ == "__main__":
    main()
