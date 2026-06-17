import { NextResponse } from "next/server";
import { getPlatform } from "@/lib/platform";

export const dynamic = "force-dynamic";

/** GET /api/platform/v0/platforms/:slug — platform detail + provenance */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPlatform(slug);
  if (!p || p.status !== "published") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ platform: p }, { headers: { "cache-control": "no-store" } });
}
