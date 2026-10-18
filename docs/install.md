# Installation & First-Time Setup

This guide walks you through installing Taximeter and getting your company server ready. No
programming knowledge required.

> **One install = one taxi company.** Everything runs on your own server; there is no shared cloud
> and no per-ride commission.

---

## What you need

### The server

Taximeter runs in Docker on any machine that stays on 24/7. Because drivers and passengers connect
over the internet, the server must be **reachable from outside your local network** — a small VPS
(cloud server) with a public address is the simplest option, or an on-premises machine with a
fixed public IP / port-forwarding.

| | Minimum | Recommended |
|---|---|---|
| RAM | 4 GB | 8 GB |
| Storage | 20 GB free | 40 GB free |
| System | Ubuntu 22, Debian 12, or any Docker host | A small cloud VPS |
| Network | A public address drivers/passengers can reach | A domain name + HTTPS |

### Reachability

- Drivers and passengers pair their phones to your server by scanning a **QR code** that contains
  your server URL, so that URL must work from a phone on mobile data — not just your office WiFi.
- A domain name (e.g. `dispatch.mitaxi.com`) with HTTPS is strongly recommended for production.
- For a first test you can run everything on your laptop and reach it at `http://localhost:3000`.

> **Tip:** Give the server a fixed address (static IP or a domain) so the pairing QR codes never
> stop working.

---

## Step 1 — Download Taximeter

Open a terminal on the server and run:

```bash
git clone https://github.com/mnavas/taximeter
cd taximeter
```

The server platform is free and open source (MIT). If you don't have Git, download the ZIP from
GitHub and extract it to a folder named `taximeter`.

---

## Step 2 — Run the install wizard

**Linux / Mac:**
```bash
./taximeter install
```

**Windows:**
```
taximeter install
```

The wizard asks a few questions, then does everything automatically:

**Question 1 — Server URL**
It shows a numbered list of your machine's addresses. Pick the one drivers and passengers will
reach (for a cloud server, the public address or your domain). If unsure on a laptop test, pick
`http://localhost:3000`.

**Question 2 — Company name**
Shown in the dashboard and the apps. You can change it later in Settings.

**Question 3 — Admin email and password**
Your login for the Taximeter dashboard. Use a real email you own; the password must be at least 6
characters and is entered twice to confirm.

After answering, the wizard:
- Installs Docker if needed (first time only),
- Builds and starts all services (a few minutes the first time),
- Creates the database, your company, and your admin account.

When it finishes you'll see something like:

```
✓ Taximeter is running!

  Dashboard: http://your-server:3000/dashboard
  Studio:    http://your-server:3001
```

Open the Dashboard link and log in.

---

## Step 3 — Configure your company

Go to **Settings** in the dashboard. Everything here is yours to control:

| Setting | What it does |
|---|---|
| **Company info** | Name, timezone, contact. |
| **Availability radius** | How close a taxi must be to count as "near" a passenger (default 3 km). |
| **Request timeout** | How long a ride request stays offerable before it expires (default 60 s). |
| **Waiting-time billing** | Turn on to bill waiting time; set the speed threshold below which time is billed instead of distance. Off = distance only. |
| **Payment QR scope** | Whether each **driver** shows their own payment QR, or the whole company uses one **company** QR. |
| **Payment fraud check** | Optionally OCR-check shared payment proofs for duplicates. |
| **Require passenger accounts** | Off by default (anonymous rides allowed). Turn on to require every passenger to have a verified account. |

> Passenger accounts are email-verified. If you enable them, configure SMTP so verification emails
> can be sent — see [admin.md](admin.md).

---

## Step 4 — Set your fares and tiers

Go to **Fares**. You decide every amount. Taximeter ships with example **Economy** and **SUV**
tiers so you have a starting point.

For each tier (e.g. Economy, Shared, SUV, Luxury) set:

| Parameter | Meaning |
|---|---|
| **Flagfall** | Base amount at the start of a trip |
| **Per km** | Charge per kilometre |
| **Per min wait** | Charge per minute of waiting (only if waiting-time billing is on) |
| **Night surcharge** | Extra during a night window |
| **Booking fee** | Extra for a dispatched (requested) ride |
| **Minimum fare** | The floor — a trip never costs less |

You can also add **time rules** — for example, make *Luxury* only available after 20:00, or apply a
night surcharge from 22:00 to 06:00. See [fleet-and-fares.md](fleet-and-fares.md) for details.

---

## Step 5 — Register drivers and taxis

Go to **Drivers** and **Fleet**:

- **Taxis** — plate, make/model, color, photo, and which tiers each vehicle may serve.
- **Drivers** — name, photo, licence, phone, and (if you use per-driver payment) their payment QR.

Then generate a **pairing QR** for each driver. The driver scans it once in the driver app to link
their phone to your server and their taxi. See [fleet-and-fares.md](fleet-and-fares.md).

---

## Step 6 — Share your passenger QR

Passengers hail your company by scanning your **public company QR** (print it inside taxis, at
stands, on your website). It points their app at your server. From there they see how many taxis are
available nearby and can request a ride.

---

## Step 7 — Test before going live

1. Open the Dashboard and confirm your fares, tiers, drivers, and taxis look right.
2. Pair one driver phone and bring it on duty — confirm the taxi appears on the **Live Map** with a
   recent update time.
3. From the passenger app, request a ride and confirm the driver receives and can accept it.
4. Complete a trip and confirm it appears under the driver's history with the correct tier and fare.

---

## Auto-start on boot

All services use `restart: unless-stopped`, so Taximeter comes back automatically after a reboot or
power loss. Wait a couple of minutes after the machine starts, then check the Dashboard.

---

## Where to next

- Running dispatch day-to-day → [daily-use.md](daily-use.md)
- Fares, tiers, drivers, taxis, pairing → [fleet-and-fares.md](fleet-and-fares.md)
- Backups, updates, SMTP, troubleshooting, CLI → [admin.md](admin.md)

> **Note on availability:** the server, admin dashboard (fleet, drivers, fares, settings), live fleet
> map, QR pairing, availability counts, and dispatch (ride request → accept with ETA) are built. The
> driver and passenger apps are rolling out, with the in-trip meter and settlement next — this guide
> describes the full product so your setup is ready as each piece lands.
