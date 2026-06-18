// Workspace repository — SERVER ONLY. Maps Postgres rows ↔ domain objects and
// enforces org scoping by RAI Social user. Used by /api/workspace/v0/* routes.
// Server-only — imported only by route handlers, never by client code.
import { dbSelect, dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import type { Venture } from "@/lib/workspace";

export type Org = { id: string; name: string; balanceVnd: number };

type OrgRow = { id: string; name: string; balance_vnd: number };
type VentureRow = { id: string; org_id: string; status: string; data: Venture };

const orgFromRow = (r: OrgRow): Org => ({ id: r.id, name: r.name, balanceVnd: Number(r.balance_vnd) });

/** Ensure the user has at least one org; returns all orgs they belong to. */
export async function ensureOrgs(userId: string, displayName: string): Promise<Org[]> {
  const members = await dbSelect<{ org_id: string }>("org_members", `rai_user_id=eq.${enc(userId)}&select=org_id`);
  if (members.length === 0) {
    const orgId = `org-${userId}`;
    const name = `${displayName || "RAI"} Workspace`;
    await dbInsert("orgs", { id: orgId, name, balance_vnd: 0 });
    await dbInsert("org_members", { org_id: orgId, rai_user_id: userId, role: "owner" });
    return [{ id: orgId, name, balanceVnd: 0 }];
  }
  const ids = members.map((m) => m.org_id);
  const rows = await dbSelect<OrgRow>("orgs", `id=in.(${ids.map(enc).join(",")})&order=created_at.asc`);
  return rows.map(orgFromRow);
}

/** All ventures across the user's orgs (newest first). */
export async function listVentures(orgIds: string[]): Promise<Venture[]> {
  if (orgIds.length === 0) return [];
  const rows = await dbSelect<VentureRow>(
    "ventures",
    `org_id=in.(${orgIds.map(enc).join(",")})&order=created_at.desc&select=data`
  );
  return rows.map((r) => r.data);
}

/** Membership guard — does this user belong to this org? */
export async function userInOrg(userId: string, orgId: string): Promise<boolean> {
  const m = await dbSelect("org_members", `rai_user_id=eq.${enc(userId)}&org_id=eq.${enc(orgId)}&select=org_id`);
  return m.length > 0;
}

export async function insertVenture(v: Venture): Promise<Venture> {
  const [row] = await dbInsert<VentureRow>("ventures", {
    id: v.id,
    org_id: v.orgId,
    name: v.name,
    sector: v.sector,
    region: v.region,
    status: v.status,
    confidence: v.confidence,
    idea_prompt: v.ideaPrompt,
    data: v,
  });
  return row.data;
}

/** Update a venture, scoped to the user's orgs (no-op if it isn't theirs). */
export async function patchVenture(id: string, orgIds: string[], patch: { status?: string; data?: Venture }): Promise<void> {
  if (orgIds.length === 0) return;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status) row.status = patch.status;
  if (patch.data) {
    row.data = patch.data;
    row.status = patch.data.status;
    row.confidence = patch.data.confidence;
    row.name = patch.data.name;
  }
  await dbUpdate("ventures", `id=eq.${enc(id)}&org_id=in.(${orgIds.map(enc).join(",")})`, row);
}

/** Delete a venture, scoped to the user's orgs. */
export async function removeVenture(id: string, orgIds: string[]): Promise<void> {
  if (orgIds.length === 0) return;
  await dbDelete("ventures", `id=eq.${enc(id)}&org_id=in.(${orgIds.map(enc).join(",")})`);
}

/** URL-encode a value for a PostgREST filter. */
function enc(v: string): string {
  return encodeURIComponent(v);
}
