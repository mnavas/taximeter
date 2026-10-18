import { NextResponse } from "next/server";
import { verifyDevice } from "@/lib/device";

export const runtime = "nodejs";

/** GET /api/me — returns the calling device's identity (verifies its token). */
export async function GET(req: Request) {
  const device = await verifyDevice(req);
  if (!device) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ device });
}
