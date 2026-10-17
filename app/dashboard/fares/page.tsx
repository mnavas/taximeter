import { createAdminClient } from "@/lib/supabase/admin";
import { createTier, upsertFareParam } from "@/lib/actions";
import type { FareTier, FareParameter, FareParameterKey } from "@/lib/types";

export const dynamic = "force-dynamic";

const PARAM_KEYS: { key: FareParameterKey; label: string }[] = [
  { key: "flagfall", label: "Flagfall (base)" },
  { key: "per_km", label: "Per km" },
  { key: "per_min_wait", label: "Per min wait" },
  { key: "night_surcharge", label: "Night surcharge" },
  { key: "booking_fee", label: "Booking fee" },
  { key: "minimum_fare", label: "Minimum fare" },
];

export default async function FaresPage() {
  const supa = createAdminClient();
  const [{ data: tiers }, { data: params }] = await Promise.all([
    supa.from("fare_tier").select("*").order("sort_order"),
    supa.from("fare_parameter").select("*"),
  ]);
  const tierList = (tiers ?? []) as FareTier[];
  const paramList = (params ?? []) as FareParameter[];
  const amount = (tierId: string, key: string) =>
    paramList.find((p) => p.tier_id === tierId && p.key === key)?.amount ?? 0;

  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Fares</h1>
      <p className="tm-muted" style={{ marginTop: 0 }}>You set every amount, per tier. These feed the driver app&apos;s meter.</p>

      {tierList.map((t) => (
        <div key={t.id} className="tm-card" style={{ padding: 20, marginTop: 16 }}>
          <h2 style={{ fontSize: 17, marginTop: 0 }}>{t.name}</h2>
          {t.description && <p className="tm-muted" style={{ marginTop: -6, fontSize: 13 }}>{t.description}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {PARAM_KEYS.map((p) => (
              <form key={p.key} action={upsertFareParam} style={{ display: "grid", gap: 4 }}>
                <input type="hidden" name="tier_id" value={t.id} />
                <input type="hidden" name="key" value={p.key} />
                <label style={{ fontSize: 13 }} className="tm-muted">{p.label}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="tm-input" name="amount" type="number" step="0.01" defaultValue={amount(t.id, p.key)} />
                  <button className="tm-input" style={{ cursor: "pointer", width: "auto", padding: "0 12px", fontSize: 13 }}>Save</button>
                </div>
              </form>
            ))}
          </div>
        </div>
      ))}

      <div className="tm-card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Add a tier</h2>
        <form action={createTier} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <input className="tm-input" name="name" placeholder="Name (e.g. Luxury) *" required style={{ width: "auto", flex: 1, minWidth: 160 }} />
          <input className="tm-input" name="description" placeholder="Description" style={{ width: "auto", flex: 2, minWidth: 160 }} />
          <input className="tm-input" name="sort_order" type="number" placeholder="Order" defaultValue={tierList.length + 1} style={{ width: 90 }} />
          <button className="tm-btn" type="submit">Add tier</button>
        </form>
        <p className="tm-muted" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
          Time-of-day rules (e.g. Luxury only after 20:00) come in a later version.
        </p>
      </div>
    </section>
  );
}
