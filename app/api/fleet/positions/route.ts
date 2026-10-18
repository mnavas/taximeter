import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** GET /api/fleet/positions — on-duty taxi positions for the dashboard map (admin session). */
export async function GET() {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supa = createAdminClient();
  const { data, error } = await supa.rpc("fleet_positions");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ positions: data ?? [] });
}
