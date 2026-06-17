import { NextResponse } from "next/server";
import { getPlan } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** GET /api/pricing/v0/plans/:key — single plan / program detail */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const plan = getPlan(key);
  if (!plan) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ plan }, { headers: { "cache-control": "no-store" } });
}
