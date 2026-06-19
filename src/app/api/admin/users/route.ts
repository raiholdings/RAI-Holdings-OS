import { NextResponse } from "next/server";
import { verifyAdminJwt } from "@/lib/admin-ai";
import { dbSelect, dbUpsert, dbInsert } from "@/lib/db";

export const dynamic = "force-dynamic";

const cors = { "Access-Control-Allow-Origin": "https://admin.raiholdings.vn", "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" };
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

function gt() {
  const url = (process.env.SUPABASE_URL || process.env.SUPABASE_PUBLIC_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SERVICE_ROLE_KEY || "";
  return { url, key, h: { apikey: key, Authorization: `Bearer ${key}`, "content-type": "application/json" } };
}

async function audit(actor: { sub?: string; user_role?: string }, action: string, target_id: string, after: unknown) {
  try { await dbInsert("events", [{ actor_user_id: actor.sub ?? null, actor_role: actor.user_role ?? null, action, target_table: "auth.users", target_id, after_json: after, source: "ui" }], "audit"); } catch { /* never block */ }
}

async function mainOrgId(): Promise<string | null> {
  const o = await dbSelect<{ id: string }>("organizations", "select=id&order=created_at.asc&limit=1", "iam");
  return o[0]?.id ?? null;
}

// GET → users (GoTrue) joined with their iam role.
export async function GET(req: Request) {
  const claims = verifyAdminJwt((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!claims) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cors });
  const { url, h } = gt();
  try {
    const res = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers: h });
    const j = (await res.json()) as { users?: Record<string, unknown>[] };
    const members = await dbSelect<{ rai_user_id?: string; user_id?: string; role_key?: string; role?: string }>("memberships", "select=user_id,role_key", "iam");
    const roleByUser = new Map(members.map((m) => [String(m.user_id), m.role_key]));
    const users = (j.users ?? []).map((u) => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at, banned: !!u.banned_until && new Date(String(u.banned_until)) > new Date(), role: roleByUser.get(String(u.id)) ?? "—" }));
    return NextResponse.json({ ok: true, users }, { headers: cors });
  } catch (e) { return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500, headers: cors }); }
}

// POST { email, password, role } → create confirmed user + assign org role.
export async function POST(req: Request) {
  const claims = verifyAdminJwt((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!claims || claims.user_role !== "owner") return NextResponse.json({ error: "owner_only" }, { status: 403, headers: cors });
  const { email, password, role } = (await req.json().catch(() => ({}))) as { email?: string; password?: string; role?: string };
  if (!email || !password || password.length < 8) return NextResponse.json({ error: "need email + password(>=8)" }, { status: 400, headers: cors });
  const r = role === "admin" || role === "editor" || role === "viewer" ? role : "viewer";
  const { url, h } = gt();
  try {
    const res = await fetch(`${url}/auth/v1/admin/users`, { method: "POST", headers: h, body: JSON.stringify({ email, password, email_confirm: true }) });
    const u = (await res.json()) as { id?: string; msg?: string; error_description?: string };
    if (!u.id) return NextResponse.json({ error: u.msg || u.error_description || "create_failed" }, { status: 400, headers: cors });
    const org = await mainOrgId();
    if (org) await dbUpsert("memberships", [{ user_id: u.id, org_id: org, role_key: r }], "user_id,org_id", "iam");
    await audit(claims, "user.create", u.id, { email, role: r });
    return NextResponse.json({ ok: true, id: u.id, role: r }, { headers: cors });
  } catch (e) { return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500, headers: cors }); }
}

// PATCH { id, action: 'password'|'ban'|'unban'|'role', password?, role? }
export async function PATCH(req: Request) {
  const claims = verifyAdminJwt((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!claims || claims.user_role !== "owner") return NextResponse.json({ error: "owner_only" }, { status: 403, headers: cors });
  const b = (await req.json().catch(() => ({}))) as { id?: string; action?: string; password?: string; role?: string };
  if (!b.id || !b.action) return NextResponse.json({ error: "need id + action" }, { status: 400, headers: cors });
  const { url, h } = gt();
  try {
    if (b.action === "password") {
      if (!b.password || b.password.length < 8) return NextResponse.json({ error: "password>=8" }, { status: 400, headers: cors });
      await fetch(`${url}/auth/v1/admin/users/${b.id}`, { method: "PUT", headers: h, body: JSON.stringify({ password: b.password }) });
    } else if (b.action === "ban") {
      await fetch(`${url}/auth/v1/admin/users/${b.id}`, { method: "PUT", headers: h, body: JSON.stringify({ ban_duration: "876000h" }) });
    } else if (b.action === "unban") {
      await fetch(`${url}/auth/v1/admin/users/${b.id}`, { method: "PUT", headers: h, body: JSON.stringify({ ban_duration: "none" }) });
    } else if (b.action === "role") {
      const r = b.role === "owner" || b.role === "admin" || b.role === "editor" || b.role === "viewer" ? b.role : "viewer";
      const org = await mainOrgId();
      if (org) await dbUpsert("memberships", [{ user_id: b.id, org_id: org, role_key: r }], "user_id,org_id", "iam");
    } else return NextResponse.json({ error: "bad_action" }, { status: 400, headers: cors });
    await audit(claims, `user.${b.action}`, b.id, { role: b.role });
    return NextResponse.json({ ok: true }, { headers: cors });
  } catch (e) { return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500, headers: cors }); }
}
