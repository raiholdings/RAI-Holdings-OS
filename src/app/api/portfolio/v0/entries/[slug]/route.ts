import { NextResponse } from "next/server";
import { getEntry } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

/** GET /api/portfolio/v0/entries/:slug — entry profile */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry || entry.status !== "published") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ entry }, { headers: { "cache-control": "no-store" } });
}
