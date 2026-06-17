import { NextRequest, NextResponse } from "next/server";
import { runDraftJob } from "@/lib/pricing-ai";

export const dynamic = "force-dynamic";

/**
 * POST /api/pricing/v0/ai/run  body: { planKey? }
 * Runs the AI editing job. Returns guardrail-cleared drafts for the review queue
 * — NEVER publishes and NEVER fabricates a price (SPEC §6). A cron/queue calls
 * this; the client posts the drafts into the review queue.
 */
export async function POST(req: NextRequest) {
  let body: { planKey?: string } = {};
  try { body = await req.json(); } catch {}
  const result = await runDraftJob(body.planKey);
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
