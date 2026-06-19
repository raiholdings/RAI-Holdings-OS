import { NextRequest, NextResponse } from "next/server";
import { listListings, queryListings, getPublisher, type Category, type Compatibility, type ListingType, type Listing, type ListParams } from "@/lib/marketplace";
import { dbEnabled, dbSelect } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { data: Listing; status?: string; featured?: boolean; slug?: string; id?: string };

/** GET /api/marketplace/v0/listings?type=&category=&price=&compat=&verified=&search=&limit=&cursor= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const params: ListParams = {
    type: (sp.get("type") as ListingType) || undefined,
    category: (sp.get("category") as Category) || undefined,
    price: (sp.get("price") as "free" | "paid" | "trial") || undefined,
    compat: (sp.get("compat") as Compatibility) || undefined,
    verifiedOnly: sp.get("verified") === "1",
    search: sp.get("search") || undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    cursor: sp.get("cursor") ? Number(sp.get("cursor")) : undefined,
  };

  // One source of truth: read DB (admin-governed) when enabled; else seed store.
  let result;
  if (dbEnabled()) {
    try {
      const rows = await dbSelect<Row>("listings", "select=data,status,featured,slug,id", "marketplace");
      // promoted scalar columns (edited in admin) override the jsonb snapshot
      const all = rows.map((r) => ({ ...r.data, status: (r.status as Listing["status"]) ?? r.data.status, featured: r.featured ?? r.data.featured, slug: r.slug ?? r.data.slug, id: r.id ?? r.data.id }));
      result = queryListings(all, params);
    } catch {
      result = listListings(params);
    }
  } else {
    result = listListings(params);
  }

  const listings = result.listings.map((l) => ({ ...l, publisher: getPublisher(l.publisherId) }));
  return NextResponse.json({ listings, count: result.count, nextCursor: result.nextCursor }, { headers: { "cache-control": "no-store" } });
}
