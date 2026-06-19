import { NextResponse } from "next/server";
import { runEngine, type StepContext } from "@/lib/workspace-ai";
import type { EngineKey } from "@/lib/workspace";
import { getSession } from "@/lib/session";
import { dbEnabled, dbInsert } from "@/lib/db";

export const dynamic = "force-dynamic";

const ENGINES: EngineKey[] = ["observe", "knowledge", "opportunity", "design", "simulation", "experiment", "revenue", "learning"];

/** POST { engine, idea, context } → run one Venture Builder agent (structured output). */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { engine?: EngineKey; idea?: string; context?: StepContext };
  const engine = body.engine;
  const idea = (body.idea || "").trim();
  if (!engine || !ENGINES.includes(engine)) return NextResponse.json({ error: "bad_engine" }, { status: 400 });
  if (idea.length < 3) return NextResponse.json({ error: "bad_idea" }, { status: 400 });

  const t0 = Date.now();
  const out = await runEngine(engine, idea, body.context ?? {});
  // Telemetry for /observability (best-effort; never blocks the response on failure).
  if (dbEnabled()) {
    await dbInsert("agent_runs", [{
      engine, product: "venture", model: process.env.RAI_LLMS_MODEL ?? null,
      source: (out as { source?: string }).source ?? null,
      ok: !!(out as { data?: unknown }).data, latency_ms: Date.now() - t0,
    }], "workspace").catch(() => {});
  }
  return NextResponse.json(out, { headers: { "cache-control": "no-store" } });
}
