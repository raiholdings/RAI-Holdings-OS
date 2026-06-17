import { NextResponse } from "next/server";
import { getHomeMetrics } from "@/lib/home";

export const dynamic = "force-dynamic";

/** GET /api/home/metrics — aggregated live metrics for the homepage dashboard. */
export function GET() {
  return NextResponse.json(getHomeMetrics(), { headers: { "cache-control": "no-store" } });
}
