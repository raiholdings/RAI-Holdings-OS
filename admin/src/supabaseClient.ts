import { createClient } from "@supabase/supabase-js";

// Wired to instance #1 (api.raiholdings.vn). Falls back to placeholders so the app
// builds before the instance exists; set real values in .env (see .env.example).
const url = import.meta.env.VITE_SUPABASE_URL || "https://api.raiholdings.vn";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabaseClient = createClient(url, anonKey, {
  db: { schema: "public" },
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Decode the `user_role` / `org_id` custom claims set by the GoTrue auth hook. */
export function readClaims(accessToken?: string | null): { user_role?: string; org_id?: string } {
  if (!accessToken) return {};
  try {
    const payload = accessToken.split(".")[1];
    const json = JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))));
    return { user_role: json.user_role, org_id: json.org_id };
  } catch {
    return {};
  }
}
