import { NextResponse } from "next/server";
import { getRepo } from "@/lib/code";

export const dynamic = "force-dynamic";

/** GET /api/code/v0/repos/{owner}/{repo} — full repo (tree + blobs). */
export async function GET(_req: Request, ctx: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await ctx.params;
  const r = getRepo(owner, repo);
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(r, { headers: { "cache-control": "no-store" } });
}
