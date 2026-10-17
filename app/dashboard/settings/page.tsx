import Placeholder from "@/components/dashboard/Placeholder";

export default function SettingsPage() {
  return (
    <Placeholder title="Settings" version="v0.1">
      <p className="tm-muted" style={{ margin: 0 }}>
        Company info, availability radius, request timeout, waiting-time billing (toggle + speed
        threshold), payment QR scope (per-driver or company), fraud check, and whether passenger
        accounts are required.
      </p>
    </Placeholder>
  );
}
