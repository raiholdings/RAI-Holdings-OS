"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { typeLabels, formatVnd, listingPriceBadge } from "@/lib/marketplace";
import type { ListingWithPub } from "@/lib/marketplace-client";
import { useLang, t } from "@/lib/i18n";

export function ListingCard({ listing, compact = false }: { listing: ListingWithPub; compact?: boolean }) {
  const { tr } = useLang();
  const badge = listingPriceBadge(listing);
  const price = badge.from ? `${tr(t("from", "từ"))} ${formatVnd(badge.from)}/${tr(t("mo", "tháng"))}` : tr(t("Free", "Miễn phí"));

  return (
    <Link href={`/marketplace/${listing.slug}`} className="group flex h-full flex-col bg-surface p-5 transition-colors hover:bg-bg">
      <div className="flex items-start gap-3">
        <span className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: listing.color, background: `color-mix(in srgb, ${listing.color} 12%, transparent)` }}>
          <Icon name={listing.icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-[family-name:var(--font-display)] text-[0.98rem] font-medium text-text">{listing.name}</span>
            <span className="mono flex-none rounded-[var(--radius-sm)] bg-bg px-1.5 py-0.5 text-[0.58rem] uppercase text-text-2">{tr(typeLabels[listing.type])}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[0.72rem] text-text-2">
            <span className="truncate">{listing.publisher?.name}</span>
            {listing.publisher?.verified && <Icon name="check" size={11} style={{ color: "var(--color-ok)" }} />}
          </div>
        </div>
      </div>
      {!compact && <p className="mt-3 line-clamp-2 flex-1 text-[0.85rem] text-text-2">{tr(listing.tagline)}</p>}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="rounded-[var(--radius-sm)] px-2 py-1 text-[0.72rem] font-medium" style={badge.from ? { color: listing.color, background: `color-mix(in srgb, ${listing.color} 10%, transparent)` } : { color: "var(--color-ok)", background: "color-mix(in srgb, var(--color-ok) 10%, transparent)" }}>
          {price}
        </span>
        <span className="mono flex items-center gap-2 text-[0.7rem] text-text-2">
          <span>★ {listing.rating.toFixed(1)}</span>
          <span className="flex items-center gap-0.5"><Icon name="bolt" size={11} /> {listing.installCount.toLocaleString("en-US")}</span>
        </span>
      </div>
    </Link>
  );
}
