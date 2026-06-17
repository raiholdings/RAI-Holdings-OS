import { NextResponse } from "next/server";
import { portfolioStats } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

/** GET /api/portfolio/v0/stats — counts for the homepage (platforms/companies/investments) */
export function GET() {
  return NextResponse.json(portfolioStats(), { headers: { "cache-control": "no-store" } });
}
