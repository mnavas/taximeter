"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/map", label: "Live Map" },
  { href: "/dashboard/fleet", label: "Fleet" },
  { href: "/dashboard/drivers", label: "Drivers" },
  { href: "/dashboard/fares", label: "Fares" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--card)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 14px" }}>
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
        <strong>Taximeter</strong>
      </div>

      <nav style={{ display: "grid", gap: 2 }}>
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "9px 10px",
                borderRadius: 9,
                fontSize: 14,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--accent-ink)" : "var(--foreground)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        {email && (
          <p className="tm-muted" style={{ fontSize: 12, margin: "0 0 8px", wordBreak: "break-all" }}>
            {email}
          </p>
        )}
        <button
          onClick={logout}
          className="tm-input"
          style={{ cursor: "pointer", textAlign: "left" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
