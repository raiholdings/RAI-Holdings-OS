import { NextRequest, NextResponse } from "next/server";
import { publishServer, getEntryById, toApiServer, type ServerJson } from "@/lib/mcp-registry";
import { dbEnabled } from "@/lib/db";
import { dbPublish, dbGetEntry } from "@/lib/mcp-db";

export const dynamic = "force-dynamic";

/**
 * POST /api/mcp/v0/publish — publish/update a server (namespace auth required, DB-first).
 * Auth: Authorization: Bearer <token>. vn.rai/* → "rai_..."; io.github.* → "ghp_...".
 */
export async function POST(req: NextRequest) {
  let body: ServerJson;
  try { body = (await req.json()) as ServerJson; }
  catch { return NextResponse.json({ ok: false, errors: ["invalid JSON body"] }, { status: 400 }); }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
  const result = dbEnabled() ? await dbPublish(body, token) : publishServer(body, token);
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });

  const entry = dbEnabled() ? await dbGetEntry(result.id!) : getEntryById(result.id!);
  return NextResponse.json({ ok: true, id: result.id, server: entry ? toApiServer(entry) : undefined }, { status: 201 });
}
