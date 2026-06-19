import { NextResponse } from "next/server";
import { apps as seedApps, type RaiApp } from "@/lib/apps";
import { dbEnabled, dbSelect } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { data: RaiApp; community?: boolean; category?: string };

/** GET /api/apps/v0/apps — app catalog, DB-first (scalar community/category override), fallback seed. */
export async function GET() {
  let list: RaiApp[] = seedApps;
  if (dbEnabled()) {
    try {
      const rows = await dbSelect<Row>("apps", "select=data,community,category", "apps");
      if (rows.length) {
        list = rows.map((r) => ({ ...r.data, community: r.community ?? r.data.community, category: (r.category as RaiApp["category"]) ?? r.data.category }));
      }
    } catch { /* fall back to seed */ }
  }
  return NextResponse.json({ apps: list }, { headers: { "cache-control": "no-store" } });
}
