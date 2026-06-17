import { NextRequest, NextResponse } from "next/server";
import { runNewProfileJob, runUpdateJob, type NewProfileInput } from "@/lib/portfolio-ai";

export const dynamic = "force-dynamic";

/**
 * POST /api/portfolio/v0/ai/draft
 *   { mode: "new_profile", input: {displayName, legalName, category, sector[], notes} }
 *   { mode: "update_block", slug, notes }
 * Returns guardrail-cleared draft suggestions for the review queue — NEVER
 * publishes, NEVER fabricates company figures (SPEC §7).
 */
export async function POST(req: NextRequest) {
  let body: { mode?: string; input?: NewProfileInput; slug?: string; notes?: string } = {};
  try { body = await req.json(); } catch {}
  if (body.mode === "new_profile" && body.input) {
    return NextResponse.json(await runNewProfileJob(body.input), { headers: { "cache-control": "no-store" } });
  }
  if (body.mode === "update_block" && body.slug) {
    return NextResponse.json(await runUpdateJob(body.slug, body.notes ?? ""), { headers: { "cache-control": "no-store" } });
  }
  return NextResponse.json({ error: "invalid request" }, { status: 400 });
}
