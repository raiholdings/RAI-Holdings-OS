import { NextRequest, NextResponse } from "next/server";
import { approveImport, rejectImport } from "@/lib/mcp-registry";

export const dynamic = "force-dynamic";

/** POST /api/mcp/v0/sync/moderate — body: { name, action: "approve" | "reject" }. */
export async function POST(req: NextRequest) {
  let name = "";
  let action = "";
  try {
    ({ name, action } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const ok = action === "approve" ? approveImport(name) : action === "reject" ? rejectImport(name) : false;
  if (!ok) return NextResponse.json({ ok: false, error: "not_found_or_invalid_action" }, { status: 404 });
  return NextResponse.json({ ok: true, name, action });
}
