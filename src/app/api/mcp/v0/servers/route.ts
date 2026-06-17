import { NextRequest, NextResponse } from "next/server";
import { listServers } from "@/lib/mcp-registry";

// Mutable in-memory store → always render fresh.
export const dynamic = "force-dynamic";

/** GET /api/mcp/v0/servers?limit=&cursor=&search=&updated_since= */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const limitRaw = sp.get("limit");
  const result = listServers({
    limit: limitRaw ? Number(limitRaw) : undefined,
    cursor: sp.get("cursor") || undefined,
    search: sp.get("search") || undefined,
    updated_since: sp.get("updated_since") || undefined,
  });
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
