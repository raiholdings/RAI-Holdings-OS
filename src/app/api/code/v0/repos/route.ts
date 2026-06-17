import { NextRequest, NextResponse } from "next/server";
import { listRepos, type DeployStatus } from "@/lib/code";

export const dynamic = "force-dynamic";

/** GET /api/code/v0/repos?search=&license=&language=&status=&owner= */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const repos = listRepos({
    search: sp.get("search") || undefined,
    license: sp.get("license") || undefined,
    language: sp.get("language") || undefined,
    status: (sp.get("status") as DeployStatus) || undefined,
    owner: sp.get("owner") || undefined,
  });
  return NextResponse.json({ repos, count: repos.length }, { headers: { "cache-control": "no-store" } });
}
