"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

interface Pos {
  taxi_id: string;
  plate: string;
  lat: number;
  lng: number;
  available: boolean;
  updated_at: string;
}

export default function FleetMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    // Leaflet CSS from CDN (avoids bundler global-CSS constraints).
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current) return;
      LRef.current = L;

      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current).setView([-2.17, -79.92], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const render = (positions: Pos[]) => {
        const map = mapRef.current;
        const seen = new Set<string>();
        for (const p of positions) {
          seen.add(p.taxi_id);
          const stale = Date.now() - new Date(p.updated_at).getTime() > 120_000;
          const popup = `<b>${p.plate}</b><br>${p.available ? "Disponible" : "Ocupado"}${stale ? " · señal perdida" : ""}`;
          if (markers.current[p.taxi_id]) {
            markers.current[p.taxi_id].setLatLng([p.lat, p.lng]).setPopupContent(popup).setOpacity(stale ? 0.4 : 1);
          } else {
            const icon = L.divIcon({
              html: `<div style="font-size:26px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🚕</div>`,
              className: "",
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            });
            const m = L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(popup);
            m.setOpacity(stale ? 0.4 : 1);
            markers.current[p.taxi_id] = m;
          }
        }
        for (const id of Object.keys(markers.current)) {
          if (!seen.has(id)) {
            map.removeLayer(markers.current[id]);
            delete markers.current[id];
          }
        }
        setCount(positions.length);
      };

      const poll = async () => {
        try {
          const res = await fetch("/api/fleet/positions", { cache: "no-store" });
          if (!res.ok) {
            setError("No se pudieron cargar las posiciones");
            return;
          }
          const { positions } = await res.json();
          setError(null);
          if (!cancelled) render(positions as Pos[]);
        } catch {
          setError("Error de red");
        }
      };

      await poll();
      timer = setInterval(poll, 4000);
    })();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markers.current = {};
    };
  }, []);

  return (
    <div>
      <div
        ref={mapEl}
        style={{ height: "60vh", minHeight: 380, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}
      />
      <p className="tm-muted" style={{ fontSize: 13, marginTop: 10 }}>
        {error ?? (count === null ? "Cargando…" : `${count} taxi(s) en servicio · se actualiza cada 4 s · atenuado = señal perdida`)}
      </p>
    </div>
  );
}
