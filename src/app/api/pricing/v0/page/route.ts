import { NextResponse } from "next/server";
import { getPricingPage } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** GET /api/pricing/v0/page — published pricing page for render */
export function GET() {
  const page = getPricingPage();
  return NextResponse.json({ page }, { headers: { "cache-control": "no-store" } });
}
