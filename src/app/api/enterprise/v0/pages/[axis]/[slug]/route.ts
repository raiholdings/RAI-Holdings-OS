import { NextResponse } from "next/server";
import { axisFromUrl, getPage } from "@/lib/enterprise";

export const dynamic = "force-dynamic";

/** GET /api/enterprise/v0/pages/:axis/:slug — published page for render */
export async function GET(_req: Request, { params }: { params: Promise<{ axis: string; slug: string }> }) {
  const { axis: axisUrl, slug } = await params;
  const axis = axisFromUrl(axisUrl);
  if (!axis) return NextResponse.json({ error: "unknown axis" }, { status: 404 });
  const page = getPage(axis, slug);
  if (!page || page.status !== "published") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ page }, { headers: { "cache-control": "no-store" } });
}
