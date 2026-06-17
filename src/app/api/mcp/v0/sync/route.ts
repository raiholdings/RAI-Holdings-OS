import { NextRequest, NextResponse } from "next/server";
import { syncUpstream } from "@/lib/mcp-sync";
import { listPending } from "@/lib/mcp-registry";

export const dynamic = "force-dynamic";

/** GET /api/mcp/v0/sync — list servers awaiting review. */
export function GET() {
  return NextResponse.json({ pending: listPending() }, { headers: { "cache-control": "no-store" } });
}

/** POST /api/mcp/v0/sync — pull from upstream (body: { updated_since? }). */
export async function POST(req: NextRequest) {
  let updatedSince: string | undefined;
  try {
    const body = await req.json();
    updatedSince = body?.updated_since;
  } catch {
    /* no body is fine */
  }
  const result = await syncUpstream(updatedSince);
  return NextResponse.json(result, { status: 200 });
}
