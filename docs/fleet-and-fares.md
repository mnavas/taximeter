# Fleet & Fares

Everything about the pieces you control as the company: service tiers, fare amounts, time rules,
taxis, drivers, and pairing phones by QR.

---

## Service tiers

A **tier** is a class of service — for example **Economy**, **Shared**, **SUV**, **Luxury**. You
define as many as you like in **Fares**. Taximeter seeds **Economy** and **SUV** as examples on
install.

Each taxi declares which tiers it may serve (an SUV might serve both *SUV* and *Economy*). A driver
can only apply a tier the vehicle is allowed to serve.

---

## Fare parameters

You set the amount for each parameter, per tier. Nothing is charged that you didn't configure.

| Parameter | Meaning |
|---|---|
| `flagfall` | Base amount charged at the start of the trip |
| `per_km` | Charge per kilometre travelled |
| `per_min_wait` | Charge per minute of waiting / slow traffic |
| `night_surcharge` | Extra applied during a night window |
| `booking_fee` | Extra for a dispatched (requested) ride vs. a street hail |
| `minimum_fare` | The floor — the trip never costs less than this |

The meter computes:

```
fare = flagfall
     + per_km       × distance
     + per_min_wait × waiting   (only if waiting-time billing is on)
     + booking_fee              (if the ride was dispatched)
     + night_surcharge          (if a night window is active)
fare = max(fare, minimum_fare)
```

### Waiting-time billing

In **Settings** you choose whether to bill waiting time at all:

- **Off** — the meter bills distance only.
- **On** — a *speed-threshold* model: below your configured speed (e.g. 10 km/h) the meter bills
  **time** (`per_min_wait`); above it, **distance** (`per_km`). Never both at once, so stop-and-go
  traffic is billed fairly. The per-minute rate is each tier's `per_min_wait`.

---

## Time rules

Attach rules to a tier so availability or surcharges depend on the hour and day:

- **Availability window** — the tier is only offerable within the window.
  *Example:* `Luxury` available `20:00–04:00`.
- **Surcharge window** — a surcharge applies within the window.
  *Example:* night surcharge active `22:00–06:00`, every day.

When a driver starts a trip, the app resolves the default tier for the current time from these
rules, and the driver may override to any other tier that's currently eligible for that vehicle.

---

## Taxis

In **Fleet**, register each vehicle:

| Field | Notes |
|---|---|
| Plate | Required |
| Make / Model | Shown to the passenger after assignment |
| Color | Shown to the passenger (helps them spot the car) |
| Photo | Vehicle photo |
| Allowed tiers | Which tiers this vehicle may serve |

Suspend a taxi to take it out of service without deleting its history.

---

## Drivers

In **Drivers**, register each person:

| Field | Notes |
|---|---|
| Name | Shown to the passenger after assignment |
| Photo | Shown to the passenger |
| Licence | Your records |
| Phone | Contact |
| Payment QR | Their wallet/bank QR, used when payment scope is *per-driver* |

Suspend a driver to block them from going on duty without deleting their trips.

### Per-driver vs. company payment QR

In **Settings → Payment QR scope**:

- **Per-driver** (default) — each driver shows their own QR; fares go to the driver's account.
- **Company** — all digital payments use one company QR you configure.

---

## Pairing a driver's phone (QR)

Phones join your server by scanning a QR — no app-store account linking, no central cloud.

1. In **Drivers**, open the driver/taxi and generate a **pairing QR**.
2. The driver scans it once in the driver app.
3. The app receives a scoped token, learns which taxi it's bound to, and downloads your current fare
   config (so the meter works even offline).

A pairing code is single-use and short-lived; the device token it issues is long-lived but
**revocable** — if a phone is lost, revoke it from the dashboard and re-pair a new one.

---

## The public passenger QR

Your company has one **public QR / link** passengers scan to hail your fleet. Print it in taxis, at
stands, and put it on your website. It only lets the passenger app see availability counts and
create requests — never your fleet's positions.

> **Availability:** fare editing, fleet/driver registration, and driver pairing-QR generation are
> built into the dashboard today (example tiers are seeded on install). Time-of-day tier rules and
> driver/car photo refinements are still being polished.
