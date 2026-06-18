import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TEMP diagnostic — checks the Anthropic key + a minimal call. No secrets leaked.
export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY || "";
  const out: Record<string, unknown> = {
    hasAnthropic: !!key,
    keyPrefix: key ? key.slice(0, 7) : null,
    hasGatewayBase: !!process.env.RAI_LLMS_BASE,
    hasGatewayKey: !!process.env.RAI_LLMS_API_KEY,
  };
  if (key) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 16, messages: [{ role: "user", content: "say hi" }] }),
        signal: AbortSignal.timeout(30_000),
      });
      out.anthropicStatus = res.status;
      const j = (await res.json().catch(() => ({}))) as { error?: { type?: string; message?: string }; content?: unknown };
      out.anthropicError = j.error ? `${j.error.type}: ${j.error.message}` : null;
      out.anthropicOk = Array.isArray(j.content);
    } catch (e) {
      out.anthropicStatus = "fetch_threw";
      out.anthropicError = e instanceof Error ? e.message : String(e);
    }
  }
  return NextResponse.json(out, { headers: { "cache-control": "no-store" } });
}
