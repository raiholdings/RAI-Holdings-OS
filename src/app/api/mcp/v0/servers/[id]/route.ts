import { NextRequest, NextResponse } from "next/server";
import { getEntryById, getEntryByName, toApiServer } from "@/lib/mcp-registry";

export const dynamic = "force-dynamic";

/** GET /api/mcp/v0/servers/{server-id}?version=latest — detail + all versions. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const key = decodeURIComponent(id);
  const entry = getEntryById(key) || getEntryByName(key);
  if (!entry) {
    return NextResponse.json({ error: "not_found", message: `No server '${key}'` }, { status: 404 });
  }
  const version = req.nextUrl.searchParams.get("version") || "latest";
  const server = toApiServer(entry, version);
  (server._meta as Record<string, unknown>)["vn.rai.registry/versions"] = entry.versions.map((v) => v.version);
  return NextResponse.json(server, { headers: { "cache-control": "no-store" } });
}
