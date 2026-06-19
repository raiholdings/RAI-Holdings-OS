import { NextResponse } from "next/server";
import { verifyAdminJwt, runAdminAgent, executeConfirmed } from "@/lib/admin-ai";

export const dynamic = "force-dynamic";

const ALLOW_ORIGIN = "https://admin.raiholdings.vn";
const cors = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// POST { messages:[{role,content}] | prompt } — admin AI operator.
// Auth: Supabase admin JWT in Authorization: Bearer <token>.
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const claims = verifyAdminJwt(token);
  if (!claims) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cors });

  const body = (await req.json().catch(() => ({}))) as {
    messages?: { role: string; content: string }[]; prompt?: string;
    confirm?: { tool: string; args: Record<string, unknown> };
  };

  // 2-step confirmation: execute a previously-proposed write tool + audit it.
  if (body.confirm?.tool) {
    try {
      const res = await executeConfirmed(body.confirm.tool, body.confirm.args || {}, { sub: claims.sub, user_role: claims.user_role }, body.prompt);
      return NextResponse.json({ ok: res.ok, reply: res.ok ? "✅ Đã thực hiện." : `❌ Lỗi: ${res.error}`, result: res.data }, { headers: cors });
    } catch (e) {
      return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500, headers: cors });
    }
  }

  const messages = body.messages?.length ? body.messages : body.prompt ? [{ role: "user", content: body.prompt }] : [];
  if (!messages.length) return NextResponse.json({ error: "empty" }, { status: 400, headers: cors });

  try {
    const out = await runAdminAgent(messages.slice(-12));
    return NextResponse.json({ ok: true, ...out }, { headers: cors });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 200) }, { status: 500, headers: cors });
  }
}
