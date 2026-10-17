"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
    >
      <div className="tm-card" style={{ width: "100%", maxWidth: 380, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span
            aria-hidden
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              fontWeight: 800,
              borderRadius: 8,
              padding: "2px 8px",
            }}
          >
            TM
          </span>
          <h1 style={{ fontSize: 20, margin: 0 }}>Taximeter</h1>
        </div>
        <p className="tm-muted" style={{ marginTop: 0, fontSize: 14 }}>
          Sign in to the company dashboard.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Email
            <input
              className="tm-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Password
            <input
              className="tm-input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <button className="tm-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
