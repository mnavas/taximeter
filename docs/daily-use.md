# Daily Use Guide

How you run dispatch day-to-day with Taximeter: monitoring the fleet, handling ride requests,
trips, settlement, and passenger trust.

---

## The dashboard at a glance

After logging in you land on **Overview** — a snapshot of your fleet: taxis on duty, how many are
available, active trips, and registered drivers. The left nav takes you to each area:

| Area | What it's for |
|---|---|
| **Live Map** | Every on-duty taxi, its current route, and when it last reported in |
| **Fleet** | Your taxis |
| **Drivers** | Your drivers + pairing |
| **Fares** | Tiers, parameters, and time rules |
| **Reports** | Per-driver earnings, hours, mileage, trip count, tier mix |
| **Settings** | Company, fares policy, payments, accounts |

---

## Monitoring the fleet (Live Map)

Each on-duty taxi shows on the map with:

- Its **current position** and the **route** it is driving,
- A **last-update time** so you can spot a phone that has dropped off the network,
- Its driver and status (available / on a trip).

Taxis update as they move; a stale timestamp usually means that driver lost signal — their trips are
not lost, they sync when the phone reconnects.

---

## The ride request flow

1. A passenger requests a ride (optionally choosing a tier).
2. Taximeter offers it to eligible, available, nearby drivers.
3. The first driver to **accept** gets the trip; the passenger is notified and shown the taxi's
   plate, the driver's photo and name, the car's color and model, and a **verification code**.
4. The passenger watches the assigned taxi approach with a live distance and ETA.

Passengers only ever see **how many** taxis are near and available — never a live map of individual
taxis. Only their assigned taxi's position is shared, and only after a driver accepts.

---

## Tiers at pickup

When the driver starts a trip they pick the **tier**. The app pre-selects the right tier for the
current time (using your time rules) and the driver can switch among the tiers that vehicle is
allowed to serve. Optionally the driver confirms the passenger's **verification code** before the
meter starts — this guards against picking up the wrong person.

Because every trip stores the **tier that was applied** plus a snapshot of its amounts, you can
always see which tier a driver used on any route, at what time, and whether the fare matched.

---

## Settlement: cash or QR

At the end of a trip the driver app shows the fare. The driver chooses how it's paid:

- **Cash** — the driver taps "paid cash." Done.
- **QR** — the driver shows their payment QR (DeUna, Produbanco, or another Ecuador wallet) with the
  amount. The passenger pays in their own bank app, then uses **"Share to current ride"** in the
  passenger app to send the payment proof back. The driver sees it and confirms.

If a payment never completes, the driver can leave the trip **unpaid** and **mark** the passenger
(see below). Taximeter never holds or moves money — it only records how each trip was settled.

---

## Passenger trust: ratings and marks

- **Anonymous passengers** can request and ride, but show no history. Drivers accept them at their
  discretion.
- **Registered passengers** (optional accounts, email-verified) build a reputation — completed
  rides, rating, cancellations — which the driver sees before accepting.
- Drivers can **rate** passengers after a trip, and **mark** them for problems (payment didn't go
  through, no-show, abuse). A mark attaches to the passenger's account, device, and email, so a
  repeat offender can't dodge it by going anonymous or making a new account.

You moderate marks from the dashboard — review and clear them so the system stays fair.

---

## Reports

Open **Reports** to see, for any date range and per driver:

- Total **earnings**,
- **Hours** on duty,
- **Mileage**,
- **Trip count**, and
- The **tier breakdown** (how many Economy vs. SUV vs. Luxury, etc.).

Each trip in a driver's history shows the applied tier, the fare snapshot, the time, and whether the
passenger code was verified — so pay disputes are settled from stored data, not memory.

---

## A normal shift

1. Drivers go **on duty** in the driver app; they appear on your Live Map.
2. Requests come in and drivers accept them; passengers are matched and tracked.
3. Trips run on your fares; drivers settle each by cash or QR.
4. You watch the map, keep an eye on last-update times, and handle any marks.
5. At day's end (or any range), you pull per-driver reports.

> **Rolling out:** the server and dashboard are live first; the driver/passenger apps and live
> dispatch arrive across later versions. This guide describes the full workflow so you know how it
> all fits together.
