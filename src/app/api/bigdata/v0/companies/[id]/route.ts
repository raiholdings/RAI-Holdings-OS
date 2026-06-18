import { NextResponse } from "next/server";
import { mapCustomer, type PerfexCustomer } from "@/lib/bigdata";

export const dynamic = "force-dynamic";

const BASE = process.env.RAICRM_BASE || "https://raicrm.vn/api";
const TOKEN = process.env.RAICRM_TOKEN || "";

/** GET /api/bigdata/v0/companies/[id] — single company from raicrm.vn. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!TOKEN) return NextResponse.json({ error: "missing_token" }, { status: 503 });

  try {
    const res = await fetch(`${BASE}/customers/${encodeURIComponent(id)}`, {
      headers: { authtoken: TOKEN, accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    if (res.status === 404) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!res.ok) return NextResponse.json({ error: `upstream_${res.status}` }, { status: 502 });

    const json = (await res.json()) as PerfexCustomer | PerfexCustomer[];
    const raw = Array.isArray(json) ? json[0] : json;
    if (!raw) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ data: mapCustomer(raw), source: "raicrm.vn" }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }
}
