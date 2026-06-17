"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { allPlatforms, getCategory, pricingLabels, deploymentLabels } from "@/lib/platform";
import { effectiveRating, hydrateStore, useApprovedPlatforms, useReviews } from "@/lib/platform-store";

const WRAP = "mx-auto max-w-[1240px] px-5 sm:px-8";

export function CompareView() {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  const approved = useApprovedPlatforms();
  const reviews = useReviews();
  const sp = useSearchParams();
  const ids = (sp.get("ids") || "").split(",").filter(Boolean).slice(0, 4);
  const pool = [...allPlatforms(), ...approved];
  const cols = ids.map((slug) => pool.find((p) => p.slug === slug)).filter(Boolean) as typeof pool;

  const Row = ({ label, render }: { label: string; render: (p: (typeof cols)[number]) => React.ReactNode }) => (
    <tr className="border-t border-border">
      <td className="p-3 align-top text-text-2">{label}</td>
      {cols.map((p) => <td key={p.id} className="p-3 align-top text-text">{render(p)}</td>)}
    </tr>
  );

  return (
    <main className={`${WRAP} py-10`}>
      <Link href="/platform" className="mono mb-6 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-text-2 hover:text-text"><Icon name="arrow-up-right" size={13} className="rotate-180" />{tr(t("Catalog", "Danh mục"))}</Link>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Compare platforms", "So sánh nền tảng"))}</h1>
      <div className="accent-rule my-5" />
      {cols.length < 2 ? (
        <p className="text-[0.92rem] text-text-2">{tr(t("Pick 2–4 platforms from the catalog to compare.", "Chọn 2–4 nền tảng từ catalog để so sánh."))}</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[640px] text-left text-[0.88rem]">
            <thead><tr className="bg-surface"><th className="p-3" />{cols.map((p) => <th key={p.id} className="p-3"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-[var(--radius-md)] text-[0.66rem] font-medium text-white" style={{ background: p.accent }}>{p.monogram}</span><Link href={`/platform/${p.slug}`} className="font-medium text-text hover:text-accent">{p.name}</Link></div></th>)}</tr></thead>
            <tbody>
              <Row label={tr(t("Rating", "Đánh giá"))} render={(p) => { const r = effectiveRating(p, reviews); return r.reviewCount > 0 ? `★ ${r.ratingAvg.toFixed(1)} (${r.reviewCount})` : tr(t("No reviews", "Chưa có")); }} />
              <Row label={tr(t("Category", "Danh mục"))} render={(p) => p.categorySlugs.map((c) => getCategory(c)?.name).filter(Boolean).map((n) => tr(n!)).join(", ")} />
              <Row label={tr(t("Pricing", "Giá"))} render={(p) => tr(pricingLabels[p.pricingModel])} />
              <Row label={tr(t("Deployment", "Triển khai"))} render={(p) => p.deployment.map((d) => tr(deploymentLabels[d])).join(", ")} />
              <Row label={tr(t("Open source", "Mã nguồn mở"))} render={(p) => p.openSource ? <Icon name="check" size={15} className="text-ok" /> : <Icon name="x" size={15} className="text-text-2" />} />
              <Row label={tr(t("Platform types", "Loại"))} render={(p) => p.platformTypes.join(", ")} />
              <Row label={tr(t("Key features", "Tính năng"))} render={(p) => p.features.join(", ") || "—"} />
              <Row label="RAI" render={(p) => p.isRaiPlatform ? <span className="mono rounded-[var(--radius-md)] bg-accent px-1.5 text-[0.58rem] uppercase text-white">RAI</span> : "—"} />
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
