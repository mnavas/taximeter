"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPA_INTERNAL = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPA_PUBLIC = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Upload a photo to the public `media` bucket; returns its public URL, or null. */
async function uploadMedia(file: File, prefix: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const res = await fetch(`${SUPA_INTERNAL}/storage/v1/object/media/${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        "content-type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: bytes,
    });
    if (!res.ok) return null;
    return `${SUPA_PUBLIC}/storage/v1/object/public/media/${path}`;
  } catch {
    return null; // never block entity creation on a storage hiccup
  }
}

function file(fd: FormData, key: string): File | null {
  const v = fd.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}

function s(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  const str = typeof v === "string" ? v.trim() : "";
  return str === "" ? null : str;
}
function n(fd: FormData, key: string): number | null {
  const v = s(fd, key);
  if (v === null) return null;
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

// ── Taxis ─────────────────────────────────────────────────────────────────

export async function createTaxi(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  const plate = s(fd, "plate");
  if (!plate) return;
  const photo = file(fd, "photo");
  const photo_url = photo ? await uploadMedia(photo, "taxi") : null;
  await supa.from("taxi").insert({
    plate,
    make: s(fd, "make"),
    model: s(fd, "model"),
    color: s(fd, "color"),
    photo_url,
    allowed_tiers: fd.getAll("allowed_tiers").map(String),
  });
  revalidatePath("/dashboard/fleet");
}

export async function toggleTaxiStatus(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  const id = s(fd, "id");
  const next = s(fd, "status") === "active" ? "suspended" : "active";
  if (id) await supa.from("taxi").update({ status: next }).eq("id", id);
  revalidatePath("/dashboard/fleet");
}

// ── Drivers ───────────────────────────────────────────────────────────────

export async function createDriver(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  const name = s(fd, "name");
  if (!name) return;
  const photo = file(fd, "photo");
  const photo_url = photo ? await uploadMedia(photo, "driver") : null;
  await supa.from("driver").insert({
    name,
    licence_no: s(fd, "licence_no"),
    phone: s(fd, "phone"),
    payment_account_label: s(fd, "payment_account_label"),
    photo_url,
  });
  revalidatePath("/dashboard/drivers");
}

export async function toggleDriverStatus(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  const id = s(fd, "id");
  const next = s(fd, "status") === "active" ? "suspended" : "active";
  if (id) await supa.from("driver").update({ status: next }).eq("id", id);
  revalidatePath("/dashboard/drivers");
}

// ── Pairing QR (driver) ─────────────────────────────────────────────────────

export interface PairingResult {
  code: string;
  expiresAt: string;
  qrDataUrl: string;
  company: string;
}

/** Create a one-time pairing code for a driver+taxi and render its QR. */
export async function generateDriverPairing(
  driverId: string,
  taxiId: string
): Promise<PairingResult> {
  await requireUser();
  const supa = createAdminClient();

  const code = crypto.randomBytes(16).toString("hex");
  const { data, error } = await supa
    .from("pairing_code")
    .insert({ code, driver_id: driverId, taxi_id: taxiId })
    .select("expires_at")
    .single();
  if (error) throw new Error(error.message);

  const { data: companyRow } = await supa.from("company").select("name").limit(1).maybeSingle();
  const company = companyRow?.name ?? "Taxi company";

  const payload = JSON.stringify({
    t: "taximeter.driver",
    server: APP_URL,
    pt: code,
    company,
    taxi: taxiId,
    driver: driverId,
  });
  const qrDataUrl = await QRCode.toDataURL(payload, { width: 320, margin: 1 });

  return { code, expiresAt: data.expires_at as string, qrDataUrl, company };
}

// ── Fares ─────────────────────────────────────────────────────────────────

export async function createTier(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  const name = s(fd, "name");
  if (!name) return;
  await supa.from("fare_tier").insert({
    name,
    description: s(fd, "description"),
    sort_order: n(fd, "sort_order") ?? 0,
  });
  revalidatePath("/dashboard/fares");
}

export async function upsertFareParam(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  const tierId = s(fd, "tier_id");
  const key = s(fd, "key");
  const amount = n(fd, "amount") ?? 0;
  if (!tierId || !key) return;
  await supa
    .from("fare_parameter")
    .upsert({ tier_id: tierId, key, amount }, { onConflict: "tier_id,key" });
  revalidatePath("/dashboard/fares");
}

// ── Company settings ────────────────────────────────────────────────────────

export async function updateCompany(fd: FormData) {
  await requireUser();
  const supa = createAdminClient();
  await supa
    .from("company")
    .update({
      name: s(fd, "name") ?? "My Taxi Company",
      contact: s(fd, "contact"),
      availability_radius_m: n(fd, "availability_radius_m") ?? 3000,
      request_timeout_s: n(fd, "request_timeout_s") ?? 60,
      wait_time_billing: fd.get("wait_time_billing") === "on",
      wait_speed_threshold: n(fd, "wait_speed_threshold") ?? 10,
      payment_qr_scope: s(fd, "payment_qr_scope") ?? "per_driver",
      require_passenger_accounts: fd.get("require_passenger_accounts") === "on",
    })
    .eq("only_one", true);
  revalidatePath("/dashboard/settings");
}
