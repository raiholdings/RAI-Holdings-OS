import { NextRequest, NextResponse } from "next/server";
import { listListings, getPublisher, type Category, type Compatibility, type ListingType } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

/** GET /api/marketplace/v0/listings?type=&category=&price=&compat=&verified=&search=&limit=&cursor= */
export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = listListings({
    type: (sp.get("type") as ListingType) || undefined,
    category: (sp.get("category") as Category) || undefined,
    price: (sp.get("price") as "free" | "paid" | "trial") || undefined,
    compat: (sp.get("compat") as Compatibility) || undefined,
    verifiedOnly: sp.get("verified") === "1",
    search: sp.get("search") || undefined,
    limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    cursor: sp.get("cursor") ? Number(sp.get("cursor")) : undefined,
  });
  const listings = result.listings.map((l) => ({ ...l, publisher: getPublisher(l.publisherId) }));
  return NextResponse.json({ listings, count: result.count, nextCursor: result.nextCursor }, { headers: { "cache-control": "no-store" } });
}
