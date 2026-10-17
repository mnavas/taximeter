import { createClient } from "@/lib/supabase/server";

/** Throw if there is no logged-in admin. Used to guard server actions. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
