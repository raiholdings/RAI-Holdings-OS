import { NextResponse } from "next/server";
import { metrics, metricValue } from "@/lib/enterprise";

export const dynamic = "force-dynamic";

/** GET /api/enterprise/v0/metrics — metrics with resolved (system_query) values */
export function GET() {
  const resolved = metrics.map((m) => ({ ...m, value: metricValue(m.key) }));
  return NextResponse.json({ metrics: resolved, count: resolved.length }, { headers: { "cache-control": "no-store" } });
}
