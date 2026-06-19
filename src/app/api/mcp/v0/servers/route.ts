import { NextRequest, NextResponse } from "next/server";
import { listServers, type ListParams } from "@/lib/mcp-registry";
import { dbEnabled } from "@/lib/db";
import { dbListServers } from "@/lib/mcp-db";

export const dynamic = "force-dynamic";

/** GET /api/mcp/v0/servers?limit=&cursor=&search=&updated_since= — DB-first. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params: ListParams = {
    limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    cursor: sp.get("cursor") || undefined,
    search: sp.get("search") || undefined,
    updated_since: sp.get("updated_since") || undefined,
  };
  let result;
  if (dbEnabled()) { try { result = await dbListServers(params); } catch { result = listServers(params); } }
  else result = listServers(params);
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
