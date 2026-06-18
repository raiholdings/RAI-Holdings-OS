// Workspace repository — SERVER ONLY. Maps Postgres rows ↔ domain objects and
// enforces org scoping by RAI Social user. Used by /api/workspace/v0/* routes.
// Server-only — imported only by route handlers, never by client code.
import { dbSelect, dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import type { Venture } from "@/lib/workspace";

export type Role = "owner" | "admin" | "member";
export type Org = { id: string; name: string; balanceVnd: number; role?: Role };
export type Member = { raiUserId: string; role: Role; name: string; username: string; avatar: string };
/** Minimal RAI Social identity carried on the session. */
export type SessionUser = { userId: string; name: string; username: string; avatar: string };

type OrgRow = { id: string; name: string; balance_vnd: number };
type MemberRow = { org_id: string; rai_user_id: string; role: Role; name?: string; username?: string; avatar?: string };
type VentureRow = { id: string; org_id: string; status: string; data: Venture };

const orgFromRow = (r: OrgRow, role?: Role): Org => ({ id: r.id, name: r.name, balanceVnd: Number(r.balance_vnd), role });

/** Ensure the user has at least one org; returns all orgs they belong to (with their role). */
export async function ensureOrgs(user: SessionUser): Promise<Org[]> {
  const members = await dbSelect<MemberRow>("org_members", `rai_user_id=eq.${enc(user.userId)}&select=org_id,role`);
  if (members.length === 0) {
    const orgId = `org-${user.userId}`;
    const name = `${user.name || user.username || "RAI"} Workspace`;
    await dbInsert("orgs", { id: orgId, name, balance_vnd: 0 });
    await dbInsert("org_members", memberRow(orgId, user, "owner"));
    return [{ id: orgId, name, balanceVnd: 0, role: "owner" }];
  }
  const roleByOrg = new Map(members.map((m) => [m.org_id, m.role]));
  const ids = members.map((m) => m.org_id);
  const rows = await dbSelect<OrgRow>("orgs", `id=in.(${ids.map(enc).join(",")})&order=created_at.asc`);
  return rows.map((r) => orgFromRow(r, roleByOrg.get(r.id)));
}

/** Create a new org owned by the user. */
export async function createOrg(user: SessionUser, name: string): Promise<Org> {
  const orgId = `org-${user.userId}-${Date.now().toString(36)}`;
  await dbInsert("orgs", { id: orgId, name, balance_vnd: 0 });
  await dbInsert("org_members", memberRow(orgId, user, "owner"));
  return { id: orgId, name, balanceVnd: 0, role: "owner" };
}

/* ── ventures ─────────────────────────────────────────────────────────────── */
export async function listVentures(orgIds: string[]): Promise<Venture[]> {
  if (orgIds.length === 0) return [];
  const rows = await dbSelect<VentureRow>(
    "ventures",
    `org_id=in.(${orgIds.map(enc).join(",")})&order=created_at.desc&select=data`
  );
  return rows.map((r) => r.data);
}

export async function userInOrg(userId: string, orgId: string): Promise<boolean> {
  return (await roleOf(userId, orgId)) !== null;
}

export async function insertVenture(v: Venture): Promise<Venture> {
  const [row] = await dbInsert<VentureRow>("ventures", {
    id: v.id, org_id: v.orgId, name: v.name, sector: v.sector, region: v.region,
    status: v.status, confidence: v.confidence, idea_prompt: v.ideaPrompt, data: v,
  });
  return row.data;
}

export async function patchVenture(id: string, orgIds: string[], patch: { status?: string; data?: Venture }): Promise<void> {
  if (orgIds.length === 0) return;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status) row.status = patch.status;
  if (patch.data) { row.data = patch.data; row.status = patch.data.status; row.confidence = patch.data.confidence; row.name = patch.data.name; }
  await dbUpdate("ventures", `id=eq.${enc(id)}&org_id=in.(${orgIds.map(enc).join(",")})`, row);
}

export async function removeVenture(id: string, orgIds: string[]): Promise<void> {
  if (orgIds.length === 0) return;
  await dbDelete("ventures", `id=eq.${enc(id)}&org_id=in.(${orgIds.map(enc).join(",")})`);
}

/* ── membership / RBAC ────────────────────────────────────────────────────── */
export async function roleOf(userId: string, orgId: string): Promise<Role | null> {
  const m = await dbSelect<MemberRow>("org_members", `rai_user_id=eq.${enc(userId)}&org_id=eq.${enc(orgId)}&select=role`);
  return m.length ? m[0].role : null;
}

export async function listMembers(orgId: string): Promise<Member[]> {
  const rows = await dbSelect<MemberRow>("org_members", `org_id=eq.${enc(orgId)}&order=created_at.asc`);
  return rows.map((r) => ({ raiUserId: r.rai_user_id, role: r.role, name: r.name ?? "", username: r.username ?? "", avatar: r.avatar ?? "" }));
}

/** Add (or re-invite) a member. role must be 'admin' | 'member'. */
export async function addMember(orgId: string, who: SessionUser, role: Exclude<Role, "owner">): Promise<void> {
  await dbInsert("org_members", memberRow(orgId, who, role)).catch(async () => {
    // already a member → just update role/snapshot
    await dbUpdate("org_members", `org_id=eq.${enc(orgId)}&rai_user_id=eq.${enc(who.userId)}`,
      { role, name: who.name, username: who.username, avatar: who.avatar });
  });
}

export async function setMemberRole(orgId: string, raiUserId: string, role: Role): Promise<void> {
  await dbUpdate("org_members", `org_id=eq.${enc(orgId)}&rai_user_id=eq.${enc(raiUserId)}`, { role });
}

export async function removeMember(orgId: string, raiUserId: string): Promise<void> {
  await dbDelete("org_members", `org_id=eq.${enc(orgId)}&rai_user_id=eq.${enc(raiUserId)}`);
}

/* ── helpers ──────────────────────────────────────────────────────────────── */
function memberRow(orgId: string, u: SessionUser, role: Role) {
  return { org_id: orgId, rai_user_id: u.userId, role, name: u.name, username: u.username, avatar: u.avatar };
}
function enc(v: string): string { return encodeURIComponent(v); }
