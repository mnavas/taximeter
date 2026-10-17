import Placeholder from "@/components/dashboard/Placeholder";

export default function MapPage() {
  return (
    <Placeholder title="Live Map" version="v0.1 – v0.2">
      <p className="tm-muted" style={{ margin: 0 }}>
        A live map of every on-duty taxi — current position, route, and last-update time — rendered
        from <code>taxi_position</code> over Supabase Realtime.
      </p>
    </Placeholder>
  );
}
