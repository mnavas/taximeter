import { NextResponse } from "next/server";
import { verifyDevice } from "@/lib/device";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** GET /api/driver/requests — pending requests this driver is eligible for. */
export async function GET(req: Request) {
  const device = await verifyDevice(req);
  if (!device || device.kind !== "driver" || !device.taxi_id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supa = createAdminClient();
  const { data, error } = await supa.rpc("eligible_requests", { p_taxi: device.taxi_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ requests: data ?? [] });
}
