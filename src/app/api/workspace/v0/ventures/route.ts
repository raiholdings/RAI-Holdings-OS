import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { userInOrg, insertVenture } from "@/lib/workspace-repo";
import type { Venture } from "@/lib/workspace";

export const dynamic = "force-dynamic";

// POST { venture } → persist a venture for the signed-in user's org.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const body = (await req.json().catch(() => ({}))) as { venture?: Venture };
  const v = body.venture;
  if (!v || !v.id || !v.orgId) return NextResponse.json({ error: "bad_venture" }, { status: 400 });
  if (!(await userInOrg(session.userId, v.orgId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const saved = await insertVenture(v);
    return NextResponse.json({ db: true, venture: saved });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
