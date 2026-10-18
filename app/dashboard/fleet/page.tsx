import { createAdminClient } from "@/lib/supabase/admin";
import { createTaxi, toggleTaxiStatus } from "@/lib/actions";
import type { Taxi, FareTier } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const supa = createAdminClient();
  const [{ data: taxis }, { data: tiers }] = await Promise.all([
    supa.from("taxi").select("*").order("plate"),
    supa.from("fare_tier").select("*").order("sort_order"),
  ]);
  const list = (taxis ?? []) as Taxi[];
  const tierList = (tiers ?? []) as FareTier[];
  const tierName = (id: string) => tierList.find((t) => t.id === id)?.name ?? "—";

  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Fleet</h1>
      <p className="tm-muted" style={{ marginTop: 0 }}>Register your taxis and the tiers each may serve.</p>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Add a taxi</h2>
        <form action={createTaxi} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
            <input className="tm-input" name="plate" placeholder="Plate *" required />
            <input className="tm-input" name="make" placeholder="Make" />
            <input className="tm-input" name="model" placeholder="Model" />
            <input className="tm-input" name="color" placeholder="Color" />
          </div>
          <label style={{ fontSize: 13, display: "grid", gap: 4 }}>
            <span className="tm-muted">Vehicle photo</span>
            <input className="tm-input" name="photo" type="file" accept="image/*" />
          </label>
          <div>
            <div className="tm-muted" style={{ fontSize: 13, marginBottom: 6 }}>Allowed tiers</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {tierList.map((t) => (
                <label key={t.id} style={{ fontSize: 14, display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="checkbox" name="allowed_tiers" value={t.id} /> {t.name}
                </label>
              ))}
            </div>
          </div>
          <button className="tm-btn" type="submit" style={{ justifySelf: "start" }}>Add taxi</button>
        </form>
      </div>

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Taxis ({list.length})</h2>
        {list.length === 0 ? (
          <p className="tm-muted" style={{ margin: 0 }}>No taxis yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr className="tm-muted" style={{ textAlign: "left", fontSize: 12 }}>
                <th style={th}>Plate</th><th style={th}>Vehicle</th><th style={th}>Tiers</th><th style={th}>Status</th><th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {t.photo_url && <img src={t.photo_url} alt="" width={34} height={34} style={{ borderRadius: 6, objectFit: "cover" }} />}
                      <strong>{t.plate}</strong>
                    </div>
                  </td>
                  <td style={td}>{[t.make, t.model, t.color].filter(Boolean).join(" · ") || "—"}</td>
                  <td style={td}>{t.allowed_tiers?.map(tierName).join(", ") || "—"}</td>
                  <td style={td}>
                    <span style={{ color: t.status === "active" ? "#16a34a" : "#dc2626" }}>{t.status}</span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <form action={toggleTaxiStatus}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="status" value={t.status} />
                      <button className="tm-input" style={{ cursor: "pointer", width: "auto", padding: "4px 10px", fontSize: 13 }}>
                        {t.status === "active" ? "Suspend" : "Reactivate"}
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
