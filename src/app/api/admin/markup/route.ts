import { NextResponse } from "next/server";
import { verifyAdminJwt } from "@/lib/admin-ai";

export const dynamic = "force-dynamic";

const cors = { "Access-Control-Allow-Origin": "https://admin.raiholdings.vn", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" };
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

function gw() {
  const base = (process.env.RAI_LLMS_BASE || "").replace(/\/$/, "");
  const token = process.env.RAI_LLMS_ADMIN_TOKEN || "";
  return { base, token, h: { authorization: `Bearer ${token}`, "content-type": "application/json" } };
}

function gate(req: Request) {
  return verifyAdminJwt((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
}

// GET → markup rules from the gateway (scope/target/percent).
export async function GET(req: Request) {
  if (!gate(req)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cors });
  const { base, token, h } = gw();
  if (!base || !token) return NextResponse.json({ error: "gateway_not_configured", hint: "Set RAI_LLMS_ADMIN_TOKEN" }, { status: 503, headers: cors });
  try {
    const res = await fetch(`${base}/admin/markups`, { headers: h, cache: "no-store" });
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status, headers: cors });
  } catch { return NextResponse.json({ error: "gateway_unreachable" }, { status: 502, headers: cors }); }
}

// POST { scope, target?, percent } → upsert a markup rule.
export async function POST(req: Request) {
  if (!gate(req)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cors });
  const { base, token, h } = gw();
  if (!base || !token) return NextResponse.json({ error: "gateway_not_configured" }, { status: 503, headers: cors });
  const body = await req.text();
  try {
    const res = await fetch(`${base}/admin/markups`, { method: "POST", headers: h, body });
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status, headers: cors });
  } catch { return NextResponse.json({ error: "gateway_unreachable" }, { status: 502, headers: cors }); }
}

// DELETE ?id= → remove a markup rule.
export async function DELETE(req: Request) {
  if (!gate(req)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cors });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "bad_id" }, { status: 400, headers: cors });
  const { base, token, h } = gw();
  if (!base || !token) return NextResponse.json({ error: "gateway_not_configured" }, { status: 503, headers: cors });
  try {
    const res = await fetch(`${base}/admin/markups/${encodeURIComponent(id)}`, { method: "DELETE", headers: h });
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status, headers: cors });
  } catch { return NextResponse.json({ error: "gateway_unreachable" }, { status: 502, headers: cors }); }
}
