"use client";

import type { Listing, Publisher } from "@/lib/marketplace";

export type ListingWithPub = Listing & { publisher?: Publisher };

export async function fetchListings(): Promise<ListingWithPub[]> {
  const res = await fetch(`/api/marketplace/v0/listings?limit=100`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()).listings ?? [];
}

export async function fetchListing(slug: string): Promise<ListingWithPub | null> {
  const res = await fetch(`/api/marketplace/v0/listings/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
