import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { ensureOrgs } from "@/lib/workspace-repo";
import { listTxns, listUsage } from "@/lib/workspace-billing";

export const dynamic = "force-dynamic";

// GET ?org=<id> → { db, balanceVnd, txns, usage } for an org the user belongs to.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false });

  const wanted = new URL(req.url).searchParams.get("org") || "";
  try {
    const orgs = await ensureOrgs(session);
    const org = orgs.find((o) => o.id === wanted) ?? orgs[0];
    if (!org) return NextResponse.json({ db: true, balanceVnd: 0, txns: [], usage: [] });
    const [txns, usage] = await Promise.all([listTxns(org.id), listUsage(org.id)]);
    return NextResponse.json({ db: true, orgId: org.id, balanceVnd: org.balanceVnd, txns, usage }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ db: false, error: String(e).slice(0, 200) });
  }
}
