import { NextRequest, NextResponse } from "next/server";
import { axisFromUrl } from "@/lib/enterprise";
import { runDraftJob } from "@/lib/enterprise-ai";

export const dynamic = "force-dynamic";

/**
 * POST /api/enterprise/v0/ai/run  body: { axis, slug }
 * Runs the AI drafting job for one page. Returns guardrail-cleared drafts for
 * the review queue — NEVER publishes (SPEC_ENTERPRISE.md §6). A cron/queue would
 * call this on a schedule; the client posts the drafts into the review queue.
 */
export async function POST(req: NextRequest) {
  let body: { axis?: string; slug?: string } = {};
  try { body = await req.json(); } catch {}
  const axis = body.axis ? axisFromUrl(body.axis) : undefined;
  if (!axis || !body.slug) return NextResponse.json({ error: "axis and slug required" }, { status: 400 });
  const result = await runDraftJob(axis, body.slug);
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
