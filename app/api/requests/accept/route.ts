import { NextResponse } from "next/server";
import { verifyDevice } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * POST /api/requests/accept — a driver accepts a request with a declared pickup ETA.
 * Auth: driver device token. Body: { request_id, eta_min }
 * First-to-accept wins (atomic); a late accept returns 409.
 */
export async function POST(req: Request) {
  const device = await verifyDevice(req);
  if (!device || device.kind !== "driver" || !device.driver_id || !device.taxi_id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let b: { request_id?: string; eta_min?: number } = {};
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!b.request_id || typeof b.eta_min !== "number") {
    return NextResponse.json({ error: "request_id and eta_min required" }, { status: 400 });
  }

  const supa = createAdminClient();
  const { data, error } = await supa.rpc("accept_request", {
    p_request: b.request_id,
    p_driver: device.driver_id,
    p_taxi: device.taxi_id,
    p_eta_min: Math.round(b.eta_min),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.won) {
    return NextResponse.json({ error: "request already taken or expired" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
