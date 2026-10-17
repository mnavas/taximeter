export default function Placeholder({
  title,
  version,
  children,
}: {
  title: string;
  version: string;
  children?: React.ReactNode;
}) {
  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>{title}</h1>
      <p className="tm-muted" style={{ marginTop: 0 }}>
        Planned for <strong>{version}</strong>.
      </p>
      <div className="tm-card" style={{ padding: 28, marginTop: 16 }}>
        {children ?? (
          <p className="tm-muted" style={{ margin: 0 }}>
            This section is part of the v0.0.0 dashboard skeleton — the feature arrives in {version}.
          </p>
        )}
      </div>
    </section>
  );
}
