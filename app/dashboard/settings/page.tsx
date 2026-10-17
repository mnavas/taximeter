import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateCompany } from "@/lib/actions";
import type { Company } from "@/lib/types";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function SettingsPage() {
  const supa = createAdminClient();
  const { data } = await supa.from("company").select("*").limit(1).maybeSingle();
  const c = (data ?? {}) as Partial<Company>;

  const passengerQr = await QRCode.toDataURL(
    JSON.stringify({ t: "taximeter.passenger", server: APP_URL, company: c.name ?? "Taxi company" }),
    { width: 320, margin: 1 }
  );

  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Settings</h1>
      <p className="tm-muted" style={{ marginTop: 0 }}>Your company configuration.</p>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <form action={updateCompany} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <Field label="Company name"><input className="tm-input" name="name" defaultValue={c.name ?? ""} required /></Field>
            <Field label="Contact"><input className="tm-input" name="contact" defaultValue={c.contact ?? ""} /></Field>
            <Field label="Availability radius (m)"><input className="tm-input" name="availability_radius_m" type="number" defaultValue={c.availability_radius_m ?? 3000} /></Field>
            <Field label="Request timeout (s)"><input className="tm-input" name="request_timeout_s" type="number" defaultValue={c.request_timeout_s ?? 60} /></Field>
            <Field label="Waiting-speed threshold (km/h)"><input className="tm-input" name="wait_speed_threshold" type="number" defaultValue={c.wait_speed_threshold ?? 10} /></Field>
            <Field label="Payment QR scope">
              <select className="tm-input" name="payment_qr_scope" defaultValue={c.payment_qr_scope ?? "per_driver"}>
                <option value="per_driver">Per driver</option>
                <option value="company">Company</option>
              </select>
            </Field>
          </div>
          <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="wait_time_billing" defaultChecked={!!c.wait_time_billing} /> Bill waiting time (speed-threshold model)
          </label>
          <label style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="require_passenger_accounts" defaultChecked={!!c.require_passenger_accounts} /> Require passenger accounts (email-verified)
          </label>
          <button className="tm-btn" type="submit" style={{ justifySelf: "start" }}>Save settings</button>
        </form>
      </div>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Public passenger QR</h2>
        <p className="tm-muted" style={{ fontSize: 13 }}>
          Print this in your taxis, at stands, and on your website. Riders scan it in the Taximeter app
          to hail your fleet.
        </p>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={passengerQr} alt="Passenger QR" width={200} height={200} style={{ borderRadius: 10, background: "#fff" }} />
          <p className="tm-muted" style={{ fontSize: 13, margin: 0 }}>Server: <code>{APP_URL}</code></p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 13, display: "grid", gap: 4 }}>
      <span className="tm-muted">{label}</span>
      {children}
    </label>
  );
}
