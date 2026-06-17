import { NextResponse } from "next/server";
import { licenses } from "@/lib/code";

export const dynamic = "force-dynamic";

/** GET /api/code/v0/licenses — SPDX catalog (6 groups + RAI licenses). */
export function GET() {
  return NextResponse.json({ licenses, count: licenses.length }, { headers: { "cache-control": "no-store" } });
}
