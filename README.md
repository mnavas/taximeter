# Taximeter

**Self-hosted fleet dispatch and taxi-metering platform. One installation = one taxi company.**

A taxi company clones this repository, starts Docker, and immediately has its own server to
register its taxis, configure its own fares, dispatch rides, and monitor its fleet. Drivers and
passengers use two dedicated mobile apps that sync to *that company's* server.

> **Open server, free to self-host.** This server platform is MIT licensed — run it yourself at no
> cost. The project is funded by **paid setup/hosting help** and the **companion driver & passenger
> apps** (free to use; their source is commercial). No commissions, ever.

---

## The three pieces

| Piece | What it is | Who runs it |
|---|---|---|
| **Server** | Docker Compose stack: web dashboard + database + realtime + API | The taxi company (self-hosted) |
| **Driver app** | Mobile app — accept ride requests, pick/confirm tier, run the meter | Each driver |
| **Passenger app** | Mobile app — see availability nearby, request a ride, track the assigned taxi | The riding public |

A phone pairs to a company's server by scanning a **QR code** — no app-store account linking, no
central cloud. Each install is an island.

---

## What the company gets

- **Live fleet monitoring** — every active taxi on a map with its current route and last-update time.
- **Per-driver route history** — distance, hours worked, earnings, and *which fare/tier was applied* on every trip.
- **Company-owned fare engine** — the admin sets the amount for each metering parameter and defines service tiers (Economy, Shared, SUV, Luxury) with optional time-of-day rules.
- **Dispatch** — incoming ride requests are routed to available drivers; the passenger is notified when one accepts.

---

## Documentation

| Guide | For |
|---|---|
| [Installation & First-Time Setup](docs/install.md) | Standing up your server and configuring your company |
| [Daily Use](docs/daily-use.md) | Running dispatch: fleet map, requests, trips, settlement, trust |
| [Fleet & Fares](docs/fleet-and-fares.md) | Tiers, fare amounts, time rules, taxis, drivers, QR pairing |
| [Administration & Maintenance](docs/admin.md) | Backups, updates, SMTP, troubleshooting, CLI reference |

---

## Status

Early development (v0.0.0): self-hosted Docker stack, management CLI, database schema, and the admin
dashboard skeleton are in place. Fleet, fares, dispatch, and the mobile apps follow in v0.1+.

---

## How this is funded

The server platform (this repository) is **free and open** to self-host. The project is funded by:

- **Setup & hosting help** — paid assistance deploying, configuring, and running your instance.
- **Driver & passenger apps** — the companion mobile apps are free to use; their source is
  commercial and provided with paid plans (incl. custom-branded builds for your company).

No per-ride commission — ever.

## License

The server platform (this repository) is **MIT licensed** — see [LICENSE](LICENSE).

The driver and passenger apps are free to use, but their source is commercial and not included here.
