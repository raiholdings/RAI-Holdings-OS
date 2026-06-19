import { NextRequest, NextResponse } from "next/server";
import { listRepos, queryRepos, type DeployStatus, type Repo, type ListParams } from "@/lib/code";
import { dbEnabled, dbSelect } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { data: Repo; deploy_status?: string; license_spdx?: string };

/** GET /api/code/v0/repos?search=&license=&language=&status=&owner= — DB-first. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params: ListParams = {
    search: sp.get("search") || undefined,
    license: sp.get("license") || undefined,
    language: sp.get("language") || undefined,
    status: (sp.get("status") as DeployStatus) || undefined,
    owner: sp.get("owner") || undefined,
  };

  let repos: Repo[];
  if (dbEnabled()) {
    try {
      const rows = await dbSelect<Row>("repos", "select=data,deploy_status,license_spdx", "code");
      const all = rows.map((r) => ({ ...r.data, deployStatus: (r.deploy_status as Repo["deployStatus"]) ?? r.data.deployStatus, licenseSpdx: r.license_spdx ?? r.data.licenseSpdx }));
      repos = queryRepos(all, params);
    } catch { repos = listRepos(params); }
  } else {
    repos = listRepos(params);
  }
  return NextResponse.json({ repos, count: repos.length }, { headers: { "cache-control": "no-store" } });
}
