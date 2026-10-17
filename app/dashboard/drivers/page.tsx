import { createAdminClient } from "@/lib/supabase/admin";
import { createDriver, toggleDriverStatus } from "@/lib/actions";
import PairingTool from "@/components/dashboard/PairingTool";
import type { Driver, Taxi } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const supa = createAdminClient();
  const [{ data: drivers }, { data: taxis }] = await Promise.all([
    supa.from("driver").select("*").order("name"),
    supa.from("taxi").select("*").order("plate"),
  ]);
  const list = (drivers ?? []) as Driver[];
  const taxiList = (taxis ?? []) as Taxi[];

  const activeDrivers = list
    .filter((d) => d.status === "active")
    .map((d) => ({ id: d.id, label: d.name }));
  const activeTaxis = taxiList
    .filter((t) => t.status === "active")
    .map((t) => ({ id: t.id, label: `${t.plate}${t.model ? " · " + t.model : ""}` }));

  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Drivers</h1>
      <p className="tm-muted" style={{ marginTop: 0 }}>Register drivers and pair their phones by QR.</p>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Add a driver</h2>
        <form action={createDriver} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
            <input className="tm-input" name="name" placeholder="Name *" required />
            <input className="tm-input" name="licence_no" placeholder="Licence no." />
            <input className="tm-input" name="phone" placeholder="Phone" />
            <input className="tm-input" name="payment_account_label" placeholder="Payment account (QR)" />
          </div>
          <button className="tm-btn" type="submit" style={{ justifySelf: "start" }}>Add driver</button>
        </form>
      </div>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Pair a phone</h2>
        <PairingTool drivers={activeDrivers} taxis={activeTaxis} />
      </div>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Drivers ({list.length})</h2>
        {list.length === 0 ? (
          <p className="tm-muted" style={{ margin: 0 }}>No drivers yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr className="tm-muted" style={{ textAlign: "left", fontSize: 12 }}>
                <th style={th}>Name</th><th style={th}>Licence</th><th style={th}>Phone</th><th style={th}>Status</th><th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={td}><strong>{d.name}</strong></td>
                  <td style={td}>{d.licence_no ?? "—"}</td>
                  <td style={td}>{d.phone ?? "—"}</td>
                  <td style={td}><span style={{ color: d.status === "active" ? "#16a34a" : "#dc2626" }}>{d.status}</span></td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <form action={toggleDriverStatus}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="status" value={d.status} />
                      <button className="tm-input" style={{ cursor: "pointer", width: "auto", padding: "4px 10px", fontSize: 13 }}>
                        {d.status === "active" ? "Suspend" : "Reactivate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

const th: React.CSSProperties = { padding: "6px 8px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "10px 8px", verticalAlign: "top" };
