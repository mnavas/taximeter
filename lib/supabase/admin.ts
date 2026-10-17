import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client for server-side API routes. Bypasses RLS, so it
// must only be used from trusted server code (never shipped to the browser).
const SUPABASE_URL =
  process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
