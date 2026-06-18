import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { createOrg, ensureOrgs } from "@/lib/workspace-repo";

export const dynamic = "force-dynamic";

// POST { name } → create a new org owned by the signed-in user.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { name } = (await req.json().catch(() => ({}))) as { name?: string };
  const clean = (name || "").trim();
  if (clean.length < 2) return NextResponse.json({ error: "bad_name" }, { status: 400 });

  try {
    await ensureOrgs(session); // make sure the user is provisioned first
    const org = await createOrg(session, clean);
    return NextResponse.json({ db: true, org });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
