import { NextResponse } from "next/server";
import { verifyAdminJwt } from "@/lib/admin-ai";
import { dbUpsert } from "@/lib/db";
import { listListings } from "@/lib/marketplace";
import { listRepos } from "@/lib/code";
import { apps as appCatalog } from "@/lib/apps";
import { listServers, namespaceOf } from "@/lib/mcp-registry";

export const dynamic = "force-dynamic";

const cors = { "Access-Control-Allow-Origin": "https://admin.raiholdings.vn", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" };
export function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

// POST → upsert the in-app Solutions catalogs into Postgres (admin only).
// One-shot migration; safe to re-run (upsert on id).
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!verifyAdminJwt(token)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: cors });

  const out: Record<string, number> = {};
  try {
    // marketplace.listings (listListings returns { listings } and filters approved)
    const lr = listListings({ limit: 200 }, []) as { listings?: unknown[] };
    const listings = (lr.listings ?? []) as Record<string, unknown>[];
    if (listings.length) {
      await dbUpsert("listings", listings.map((l) => ({
        id: l.id, slug: l.slug, name: l.name, type: l.type, status: l.status,
        featured: !!l.featured, publisher_id: l.publisherId, rating: l.rating ?? 0,
        install_count: l.installCount ?? 0, data: l,
      })), "id", "marketplace");
    }
    out.listings = listings.length;

    // code.repos
    const repos = listRepos({}, []) as Record<string, unknown>[];
    if (repos.length) {
      await dbUpsert("repos", repos.map((r) => ({
        id: r.id, owner: r.owner, name: r.name, slug: r.slug,
        license_spdx: r.licenseSpdx, deploy_status: r.deployStatus, data: r,
      })), "id", "code");
    }
    out.repos = repos.length;

    // apps.apps
    if (appCatalog.length) {
      await dbUpsert("apps", appCatalog.map((a) => ({
        id: a.id, name: a.name, category: a.category, developer: a.developer,
        community: !!a.community, data: a,
      })), "id", "apps");
    }
    out.apps = appCatalog.length;

    // mcp.servers (listServers returns { servers })
    const sr = listServers({ limit: 200 }) as { servers?: unknown[] };
    const servers = (sr.servers ?? []) as Record<string, unknown>[];
    if (servers.length) {
      await dbUpsert("servers", servers.map((s) => {
        const meta = ((s._meta as Record<string, unknown>)?.["vn.rai.registry/official"] ?? {}) as Record<string, unknown>;
        const name = String(s.name ?? "");
        return {
          id: String(meta.id ?? name), name, namespace: namespaceOf(name),
          status: meta.status ?? s.status, source: meta.source ?? s.source, data: s,
        };
      }), "id", "mcp");
    }
    out.servers = servers.length;

    return NextResponse.json({ ok: true, seeded: out }, { headers: cors });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 300), seeded: out }, { status: 500, headers: cors });
  }
}
