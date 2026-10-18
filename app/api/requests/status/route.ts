import { NextResponse } from "next/server";
import { verifyDevice } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * GET /api/requests/status?id= — a passenger polls their request.
 * Before acceptance: { status }. After: taxi/driver details + verification code + ETA.
 */
export async function GET(req: Request) {
  const device = await verifyDevice(req);
  if (!device || device.kind !== "passenger") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supa = createAdminClient();
  const { data, error } = await supa.rpc("request_status", { p_request: id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.passenger_id !== device.passenger_id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const base = { status: row.status as string };
  if (row.status !== "accepted") return NextResponse.json(base);

  return NextResponse.json({
    ...base,
    verification_code: row.verification_code,
    eta_declared_min: row.eta_declared_min,
    pickup_distance_m: row.pickup_distance_m,
    driver_name: row.driver_name,
    driver_photo: row.driver_photo,
    plate: row.plate,
    car: row.car,
  });
}
