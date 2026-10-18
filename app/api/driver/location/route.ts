import { NextResponse } from "next/server";
import { verifyDevice } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/driver/location — the driver app streams its taxi's position + duty.
 * Auth: driver device token. Body: { lat, lng, heading?, speed?, on_duty?, available? }
 */
export async function POST(req: Request) {
  const device = await verifyDevice(req);
  if (!device || device.kind !== "driver" || !device.taxi_id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let b: {
    lat?: number; lng?: number; heading?: number; speed?: number;
    on_duty?: boolean; available?: boolean;
  } = {};
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (typeof b.lat !== "number" || typeof b.lng !== "number") {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const supa = createAdminClient();
  const { error } = await supa.rpc("update_position", {
    p_taxi: device.taxi_id,
    p_lat: b.lat,
    p_lng: b.lng,
    p_heading: b.heading ?? null,
    p_speed: b.speed ?? null,
    p_on_duty: b.on_duty ?? true,
    p_available: b.available ?? true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
