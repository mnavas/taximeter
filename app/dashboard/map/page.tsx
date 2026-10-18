import FleetMap from "@/components/dashboard/FleetMap";

export const dynamic = "force-dynamic";

export default function MapPage() {
  return (
    <section>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Live Map</h1>
      <p className="tm-muted" style={{ marginTop: 0, marginBottom: 16 }}>
        On-duty taxis, updating live. A faded marker means that taxi hasn&apos;t reported in recently.
      </p>
      <FleetMap />
    </section>
  );
}
