import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { dbEnabled } from "@/lib/db";
import { roleOf } from "@/lib/workspace-repo";
import { applyWallet } from "@/lib/workspace-billing";

export const dynamic = "force-dynamic";

// POST { orgId, amountVnd } → add credit to an org wallet (owner/admin only).
// NOTE: this records a manual credit in the ledger. Real VNPay/MoMo settlement
// (Phase 3) will call applyWallet('topup') from the payment webhook.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!dbEnabled()) return NextResponse.json({ db: false }, { status: 501 });

  const { orgId, amountVnd } = (await req.json().catch(() => ({}))) as { orgId?: string; amountVnd?: number };
  const amount = Math.trunc(Number(amountVnd) || 0);
  if (!orgId) return NextResponse.json({ error: "bad_org" }, { status: 400 });
  if (amount <= 0 || amount > 1_000_000_000) return NextResponse.json({ error: "bad_amount" }, { status: 400 });

  try {
    const role = await roleOf(session.userId, orgId);
    if (role !== "owner" && role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const balanceVnd = await applyWallet(orgId, amount, "topup", "manual top-up", session.userId);
    return NextResponse.json({ db: true, balanceVnd });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500 });
  }
}
