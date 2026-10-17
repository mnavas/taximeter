"use client";

import { useState } from "react";
import { generateDriverPairing, type PairingResult } from "@/lib/actions";

interface Opt { id: string; label: string }

export default function PairingTool({ drivers, taxis }: { drivers: Opt[]; taxis: Opt[] }) {
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [taxiId, setTaxiId] = useState(taxis[0]?.id ?? "");
  const [result, setResult] = useState<PairingResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    if (!driverId || !taxiId) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await generateDriverPairing(driverId, taxiId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate pairing code");
    } finally {
      setBusy(false);
    }
  }

  if (drivers.length === 0 || taxis.length === 0) {
    return (
      <p className="tm-muted" style={{ margin: 0 }}>
        Add at least one active driver and one active taxi to generate a pairing QR.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label style={{ fontSize: 13, display: "grid", gap: 4 }}>
          Driver
          <select className="tm-input" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 13, display: "grid", gap: 4 }}>
          Taxi
          <select className="tm-input" value={taxiId} onChange={(e) => setTaxiId(e.target.value)}>
            {taxis.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
      </div>
      <button className="tm-btn" onClick={onGenerate} disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? "Generating…" : "Generate pairing QR"}
      </button>

      {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}

      {result && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginTop: 4 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.qrDataUrl} alt="Pairing QR" width={200} height={200} style={{ borderRadius: 10, background: "#fff" }} />
          <div style={{ fontSize: 13 }}>
            <p className="tm-muted" style={{ margin: "0 0 6px" }}>
              Have the driver scan this in the <strong>Taximeter Driver</strong> app.
            </p>
            <p style={{ margin: "0 0 4px" }}>Code: <code>{result.code}</code></p>
            <p className="tm-muted" style={{ margin: 0 }}>
              Expires {new Date(result.expiresAt).toLocaleString()}. One-time use.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
