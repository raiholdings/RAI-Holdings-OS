import { NextResponse } from "next/server";
import { mapCustomer, type CompanySearchResult, type PerfexCustomer } from "@/lib/bigdata";

export const dynamic = "force-dynamic";

const BASE = process.env.RAICRM_BASE || "https://raicrm.vn/api";
const TOKEN = process.env.RAICRM_TOKEN || "";

/**
 * GET /api/bigdata/v0/companies?q=&page=&per_page=
 * Searches raicrm.vn (Perfex) by keyword and paginates server-side.
 * The CRM list-all endpoint can't serve ~1M rows, so a query is required.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(50, Math.max(5, parseInt(url.searchParams.get("per_page") || "20", 10) || 20));

  const empty = (extra: Partial<CompanySearchResult>): CompanySearchResult => ({
    data: [], total: 0, page, perPage, source: "raicrm.vn", ...extra,
  });

  if (q.length < 2) {
    return NextResponse.json(empty({ note: "query_too_short" }), { headers: { "cache-control": "no-store" } });
  }
  if (!TOKEN) {
    return NextResponse.json(empty({ error: "missing_token" }), { headers: { "cache-control": "no-store" } });
  }

  try {
    const res = await fetch(`${BASE}/customers/search/${encodeURIComponent(q)}`, {
      headers: { authtoken: TOKEN, accept: "application/json" },
      // upstream can be slow on big result sets
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json(empty({}), { headers: { "cache-control": "no-store" } });
    }
    if (!res.ok) {
      // 500 (keyword too broad) / 403 (WAF) etc. — degrade gracefully.
      return NextResponse.json(empty({ error: `upstream_${res.status}` }), { headers: { "cache-control": "no-store" } });
    }

    const json = (await res.json()) as PerfexCustomer[] | { data?: PerfexCustomer[] };
    const rows: PerfexCustomer[] = Array.isArray(json) ? json : json.data ?? [];
    const total = rows.length;
    const start = (page - 1) * perPage;
    const data = rows.slice(start, start + perPage).map(mapCustomer);

    const result: CompanySearchResult = { data, total, page, perPage, source: "raicrm.vn" };
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json(empty({ error: "upstream_unreachable" }), { headers: { "cache-control": "no-store" } });
  }
}
