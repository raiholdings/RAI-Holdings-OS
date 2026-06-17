"use client";

import { Icon } from "@/components/ui/Icon";
import { formatVnd, type Listing, type PricingPlan, type Publisher } from "@/lib/marketplace";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function PricingTable({
  listing, publisher, cycle, currentPlanId, onSelect,
}: {
  listing: Listing; publisher?: Publisher; cycle: "monthly" | "yearly"; currentPlanId?: string; onSelect: (p: PricingPlan) => void;
}) {
  const { tr } = useLang();
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border", listing.plans.length > 1 ? "sm:grid-cols-2" : "")}>
      {listing.plans.map((p) => {
        const paid = p.type !== "free";
        const blockedPaid = paid && !publisher?.verified;
        const price = p.type === "free" ? tr(t("Free", "Miễn phí")) : cycle === "yearly" ? `${formatVnd(p.priceYearly)}/${tr(t("yr", "năm"))}` : `${formatVnd(p.priceMonthly)}/${tr(t("mo", "tháng"))}`;
        const isCurrent = currentPlanId === p.id;
        const label = isCurrent ? tr(t("Current plan", "Gói hiện tại")) : p.type === "free" ? tr(t("Install", "Cài đặt")) : p.hasFreeTrial ? tr(t("Start free trial", "Dùng thử miễn phí")) : tr(t("Buy", "Mua"));
        return (
          <div key={p.id} className="flex flex-col bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-display)] text-[1.05rem] font-medium text-text">{tr(p.name)}</span>
              {p.hasFreeTrial && <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.62rem] uppercase" style={{ color: "var(--color-accent)", background: "color-mix(in srgb, var(--color-accent) 12%, transparent)" }}>{tr(t("14-day trial", "Dùng thử 14 ngày"))}</span>}
            </div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-[1.4rem] font-medium" style={{ color: listing.color }}>{price}</div>
            {p.type === "per_unit" && p.perUnitName && <div className="mono text-[0.72rem] text-text-2">{tr(p.perUnitName)}</div>}
            <ul className="mt-4 grid flex-1 gap-2 border-t border-border pt-4">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[0.84rem] text-text">
                  <span className="mt-0.5 flex-none" style={{ color: listing.color }}><Icon name="check" size={14} /></span>
                  {tr(f)}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !isCurrent && !blockedPaid && onSelect(p)}
              disabled={isCurrent || blockedPaid}
              className={cn("mt-5 rounded-[var(--radius-md)] py-2.5 text-[0.88rem] font-medium transition-colors", isCurrent || blockedPaid ? "cursor-not-allowed border border-border text-text-2" : "text-white")}
              style={isCurrent || blockedPaid ? undefined : { background: listing.color }}
            >
              {blockedPaid ? tr(t("Verified publishers only", "Chỉ nhà phát hành xác thực")) : label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
