const STATS = [
  { label: "Taxis on duty", value: "—" },
  { label: "Available now", value: "—" },
  { label: "Active trips", value: "—" },
  { label: "Registered drivers", value: "—" },
];

export default function DashboardOverview() {
  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Overview</h1>
      <p className="tm-muted" style={{ marginTop: 0 }}>
        Your fleet at a glance. Live numbers appear once the driver app comes online (v0.2).
      </p>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginTop: 18,
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="tm-card" style={{ padding: 18 }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{s.value}</div>
            <div className="tm-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="tm-card" style={{ padding: 22, marginTop: 18 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Getting started</h2>
        <ol className="tm-muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
          <li>Set your company info and fare tiers in <strong>Settings</strong> and <strong>Fares</strong>.</li>
          <li>Register your <strong>drivers</strong> and <strong>taxis</strong>, then pair each phone by QR.</li>
          <li>Watch the <strong>Live Map</strong> as taxis come on duty.</li>
        </ol>
        <p className="tm-muted" style={{ fontSize: 13, marginTop: 14 }}>
          These flows are being built out across v0.1–v0.3 — see <code>docs/roadmap.md</code>.
        </p>
      </div>
    </section>
  );
}
