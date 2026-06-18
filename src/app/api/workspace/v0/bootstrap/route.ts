import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { ensureOrgs, listVentures } from "@/lib/workspace-repo";

export const dynamic = "force-dynamic";

// GET → workspace state for the signed-in user.
// { db:false } when persistence is off → the client uses its localStorage store.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false });

  try {
    const orgs = await ensureOrgs(session.userId, session.name || session.username);
    const ventures = await listVentures(orgs.map((o) => o.id));
    return NextResponse.json({ db: true, orgs, ventures }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    // DB hiccup → don't break the workspace; client stays on localStorage.
    return NextResponse.json({ db: false, error: String(e).slice(0, 200) });
  }
}
