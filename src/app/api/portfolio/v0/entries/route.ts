import { NextRequest, NextResponse } from "next/server";
import { listEntries, type Pillar, type PortfolioTab } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

/** GET /api/portfolio/v0/entries?tab=&pillar=&sector=&search= */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const entries = listEntries({
    tab: (sp.get("tab") as PortfolioTab) || undefined,
    pillar: (sp.get("pillar") as Pillar) || undefined,
    sector: sp.get("sector") || undefined,
    search: sp.get("search") || undefined,
  });
  return NextResponse.json({ entries, count: entries.length }, { headers: { "cache-control": "no-store" } });
}
