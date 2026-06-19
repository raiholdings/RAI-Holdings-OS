import { NextRequest, NextResponse } from "next/server";
import { syncUpstream } from "@/lib/mcp-sync";
import { listPending } from "@/lib/mcp-registry";
import { dbEnabled } from "@/lib/db";
import { dbListPending, dbImport } from "@/lib/mcp-db";

export const dynamic = "force-dynamic";

/** GET /api/mcp/v0/sync — list servers awaiting review (DB-first). */
export async function GET() {
  const pending = dbEnabled() ? await dbListPending() : listPending();
  return NextResponse.json({ pending }, { headers: { "cache-control": "no-store" } });
}

/** POST /api/mcp/v0/sync — pull from upstream (body: { updated_since? }), queue in DB. */
export async function POST(req: NextRequest) {
  let updatedSince: string | undefined;
  try { updatedSince = (await req.json())?.updated_since; } catch { /* no body is fine */ }
  const result = await syncUpstream(updatedSince, dbEnabled() ? dbImport : undefined);
  return NextResponse.json(result, { status: 200 });
}
