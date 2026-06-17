import { NextRequest, NextResponse } from "next/server";
import { axisFromUrl, listPages, pageRefs, type Axis } from "@/lib/enterprise";

export const dynamic = "force-dynamic";

/** GET /api/enterprise/v0/pages?axis=size|use-case|industry&full=1 */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const axis: Axis | undefined = sp.get("axis") ? axisFromUrl(sp.get("axis")!) : undefined;
  if (sp.get("full") === "1") {
    const pages = listPages(axis).filter((p) => p.status === "published");
    return NextResponse.json({ pages, count: pages.length }, { headers: { "cache-control": "no-store" } });
  }
  const refs = pageRefs(axis);
  return NextResponse.json({ pages: refs, count: refs.length }, { headers: { "cache-control": "no-store" } });
}
