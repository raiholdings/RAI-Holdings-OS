import { cookies } from "next/headers";

// Temporary shared-password gate for /admin. Replaced by Supabase Auth once
// instance #1 (api.raiholdings.vn) is live. Set ADMIN_PASSWORD in the Worker env.
export const ADMIN_COOKIE = "rai_admin";
const DEFAULT_PASSWORD = "raiholdings";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
}

/** Opaque session token derived from the password — not the password itself. */
export async function expectedToken(): Promise<string> {
  const data = new TextEncoder().encode(`${adminPassword()}::rai-admin-v1`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  const v = jar.get(ADMIN_COOKIE)?.value;
  return !!v && v === (await expectedToken());
}
