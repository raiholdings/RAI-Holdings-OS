import { NextRequest, NextResponse } from "next/server";
import { approveImport, rejectImport } from "@/lib/mcp-registry";
import { dbEnabled } from "@/lib/db";
import { dbApprove, dbReject } from "@/lib/mcp-db";

export const dynamic = "force-dynamic";

/** POST /api/mcp/v0/sync/moderate — body: { name, action: "approve" | "reject" } (DB-first). */
export async function POST(req: NextRequest) {
  let name = "";
  let action = "";
  try { ({ name, action } = await req.json()); }
  catch { return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 }); }

  let ok = false;
  if (action === "approve") ok = dbEnabled() ? await dbApprove(name) : approveImport(name);
  else if (action === "reject") ok = dbEnabled() ? await dbReject(name) : rejectImport(name);

  if (!ok) return NextResponse.json({ ok: false, error: "not_found_or_invalid_action" }, { status: 404 });
  return NextResponse.json({ ok: true, name, action });
}
