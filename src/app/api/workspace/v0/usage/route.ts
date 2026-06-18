import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { roleOf } from "@/lib/workspace-repo";
import { recordUsage } from "@/lib/workspace-billing";

export const dynamic = "force-dynamic";

// POST { orgId, product, model?, units?, costVnd? } → record metered usage and
// debit its cost from the org wallet. Any member may record usage.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const body = (await req.json().catch(() => ({}))) as {
    orgId?: string; product?: string; model?: string; units?: number; costVnd?: number;
  };
  if (!body.orgId || !body.product) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    if (!(await roleOf(session.userId, body.orgId))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const out = await recordUsage(body.orgId, session.userId, {
      product: body.product, model: body.model, units: body.units, costVnd: body.costVnd,
    });
    return NextResponse.json({ db: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
