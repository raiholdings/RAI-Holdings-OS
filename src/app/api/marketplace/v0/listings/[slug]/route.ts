import { NextResponse } from "next/server";
import { getListingBySlug, getPublisher, type Listing } from "@/lib/marketplace";
import { dbEnabled, dbSelect } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { data: Listing; status?: string; featured?: boolean };

/** GET /api/marketplace/v0/listings/{slug} — full listing + publisher (DB-first). */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  let listing: Listing | undefined;

  if (dbEnabled()) {
    try {
      const rows = await dbSelect<Row>("listings", `slug=eq.${encodeURIComponent(slug)}&select=data,status,featured&limit=1`, "marketplace");
      if (rows[0]) listing = { ...rows[0].data, status: (rows[0].status as Listing["status"]) ?? rows[0].data.status, featured: rows[0].featured ?? rows[0].data.featured };
    } catch { /* fall back below */ }
  }
  if (!listing) listing = getListingBySlug(slug);
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ...listing, publisher: getPublisher(listing.publisherId) }, { headers: { "cache-control": "no-store" } });
}
