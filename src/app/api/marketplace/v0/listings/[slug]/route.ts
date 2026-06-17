import { NextResponse } from "next/server";
import { getListingBySlug, getPublisher } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

/** GET /api/marketplace/v0/listings/{slug} — full listing + publisher. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const listing = getListingBySlug(slug);
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ...listing, publisher: getPublisher(listing.publisherId) }, { headers: { "cache-control": "no-store" } });
}
