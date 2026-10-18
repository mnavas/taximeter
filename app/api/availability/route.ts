import { NextResponse } from "next/server";
import { verifyDevice } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET /api/availability?lat=&lng= — counts of taxis near a point (privacy: counts
 * only, never positions). Auth: any paired device token.
 */
export async function GET(req: Request) {
  const device = await verifyDevice(req);
  if (!device) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const supa = createAdminClient();
  const { data, error } = await supa.rpc("availability", { p_lat: lat, p_lng: lng });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    near: Number(row?.near ?? 0),
    available: Number(row?.available ?? 0),
  });
}
