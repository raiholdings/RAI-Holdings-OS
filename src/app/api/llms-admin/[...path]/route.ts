import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Server-side proxy to the RAI LLMs gateway /admin/* API. Keeps the gateway
// ADMIN_TOKEN on the server — never exposed to the browser. Gated upstream by
// the /admin password layer (this route lives under the admin area's trust).
// Read env inside the handler — not available at module load on Cloudflare Workers.
const baseOf = () => (process.env.RAI_LLMS_BASE || process.env.NEXT_PUBLIC_RAI_LLMS_BASE || "").replace(/\/$/, "");
const adminTokenOf = () => process.env.RAI_LLMS_ADMIN_TOKEN || "";

async function forward(method: string, path: string[], req: Request): Promise<Response> {
  const BASE = baseOf();
  const ADMIN_TOKEN = adminTokenOf();
  if (!BASE || !ADMIN_TOKEN) {
    return NextResponse.json({ error: "gateway_not_configured", hint: "Set RAI_LLMS_BASE + RAI_LLMS_ADMIN_TOKEN" }, { status: 503 });
  }
  const url = new URL(req.url);
  const target = `${BASE}/admin/${path.join("/")}${url.search}`;
  const init: RequestInit = {
    method,
    headers: { authorization: `Bearer ${ADMIN_TOKEN}`, "content-type": "application/json" },
    cache: "no-store",
  };
  if (method !== "GET" && method !== "DELETE") init.body = await req.text();
  try {
    const res = await fetch(target, init);
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json", "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "gateway_unreachable" }, { status: 502 });
  }
}

type Ctx = { params: Promise<{ path: string[] }> };
export async function GET(req: Request, { params }: Ctx) { return forward("GET", (await params).path, req); }
export async function POST(req: Request, { params }: Ctx) { return forward("POST", (await params).path, req); }
export async function DELETE(req: Request, { params }: Ctx) { return forward("DELETE", (await params).path, req); }
export async function PATCH(req: Request, { params }: Ctx) { return forward("PATCH", (await params).path, req); }
