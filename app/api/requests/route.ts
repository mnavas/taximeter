import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyDevice } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/requests — a passenger requests a ride.
 * Auth: passenger device token. Body: { lat, lng, tier_id? }
 * Returns: { id, code, expires_at }
 */
export async function POST(req: Request) {
  const device = await verifyDevice(req);
  if (!device || device.kind !== "passenger" || !device.passenger_id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let b: { lat?: number; lng?: number; tier_id?: string } = {};
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (typeof b.lat !== "number" || typeof b.lng !== "number") {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const supa = createAdminClient();
  const { data: company } = await supa.from("company").select("request_timeout_s").limit(1).maybeSingle();
  const timeout = company?.request_timeout_s ?? 60;
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

  const { data, error } = await supa.rpc("create_request", {
    p_passenger: device.passenger_id,
    p_lat: b.lat,
    p_lng: b.lng,
    p_tier: b.tier_id ?? null,
    p_code: code,
    p_timeout: timeout,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ id: row?.id, code, expires_at: row?.expires_at });
}
