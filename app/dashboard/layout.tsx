import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "230px 1fr",
        minHeight: "100vh",
      }}
    >
      <Sidebar email={user.email ?? null} />
      <main style={{ padding: "28px clamp(16px, 4vw, 40px)" }}>{children}</main>
    </div>
  );
}
