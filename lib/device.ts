import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DeviceIdentity {
  id: string;
  kind: "driver" | "passenger";
  driver_id: string | null;
  taxi_id: string | null;
  passenger_id: string | null;
}

/**
 * Verify an app's device token from the `Authorization: Bearer <token>` header.
 * Returns the device identity, or null if missing/invalid/revoked. The device
 * token is issued at pairing (POST /api/pair); only its SHA-256 hash is stored.
 */
export async function verifyDevice(req: Request): Promise<DeviceIdentity | null> {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;

  const tokenHash = crypto.createHash("sha256").update(m[1].trim()).digest("hex");
  const supa = createAdminClient();

  const { data } = await supa
    .from("device")
    .select("id, kind, driver_id, taxi_id, passenger_id, revoked")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!data || data.revoked) return null;

  // Touch last_seen_at (best-effort).
  await supa.from("device").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);

  return {
    id: data.id,
    kind: data.kind,
    driver_id: data.driver_id,
    taxi_id: data.taxi_id,
    passenger_id: data.passenger_id,
  };
}
