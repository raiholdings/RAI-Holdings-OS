import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/platform-ai";

export const dynamic = "force-dynamic";

/**
 * POST /api/platform/v0/ai/ingest — run the ingestion pipeline.
 * Returns guardrail-cleared, deduped IngestionSuggestions (with provenance +
 * confidence) for the review queue — NEVER publishes, NEVER copies verbatim,
 * NEVER fabricates (SPEC §7, §9). A cron would call this on a schedule.
 */
export async function POST() {
  return NextResponse.json(await runIngestion(), { headers: { "cache-control": "no-store" } });
}
