"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { categoryTree, pricingLabels, deploymentLabels, companySizeLabels, getCategory, type Platform, type PricingModel, type Deployment, type CompanySize } from "@/lib/platform";
import { effectiveRating, hydrateStore, useApprovedPlatforms, useReviews } from "@/lib/platform-store";

const WRAP = "mx-auto max-w-[1240px] px-5 sm:px-8";

function Stars({ avg, count }: { avg: number; count: number }) {
  const { tr } = useLang();
  if (count === 0) return <span className="mono text-[0.7rem] text-text-2">{tr(t("No reviews yet", "Chưa có đánh giá"))}</span>;
  return <span className="inline-flex items-center gap-1 text-[0.8rem] text-text"><span style={{ color: "#C9A227" }}>★</span>{avg.toFixed(1)} <span className="text-text-2">({count})</span></span>;
}

function PlatformCard({ p, rating, selected, onToggle }: { p: Platform; rating: { ratingAvg: number; reviewCount: number }; selected: boolean; onToggle: () => void }) {
  const { tr } = useLang();
  return (
    <div className="flex flex-col border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-[var(--radius-md)] text-[0.8rem] font-medium text-white" style={{ background: p.accent }}>{p.monogram}</span>
        <div className="flex items-center gap-1.5">
          {p.isRaiPlatform && <span className="mono rounded-[var(--radius-md)] bg-accent px-1.5 py-0.5 text-[0.56rem] uppercase tracking-wider text-white">RAI</span>}
          {p.openSource && <span className="mono rounded-[var(--radius-md)] bg-ok/15 px-1.5 py-0.5 text-[0.56rem] uppercase tracking-wider text-ok">OSS</span>}
        </div>
      </div>
      <Link href={`/platform/${p.slug}`} className="mt-3 text-[1.05rem] font-medium text-text hover:text-accent">{p.name}</Link>
      <p className="mt-1 line-clamp-2 text-[0.86rem] text-text-2">{tr(p.shortDescription)}</p>
      <div className="mt-2"><Stars avg={rating.ratingAvg} count={rating.reviewCount} /></div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-[var(--radius-md)] border border-border px-2 py-0.5 text-[0.72rem] text-text-2">{tr(pricingLabels[p.pricingModel])}</span>
        {p.deployment.slice(0, 1).map((d) => <span key={d} className="rounded-[var(--radius-md)] border border-border px-2 py-0.5 text-[0.72rem] text-text-2">{tr(deploymentLabels[d])}</span>)}
        {p.categorySlugs.slice(0, 1).map((c) => { const cat = getCategory(c); return cat ? <span key={c} className="rounded-[var(--radius-md)] border border-border px-2 py-0.5 text-[0.72rem] text-text-2">{tr(cat.name)}</span> : null; })}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Link href={`/platform/${p.slug}`} className={buttonClass("outline", "sm")}>{tr(t("View", "Xem"))}</Link>
        <button onClick={onToggle} className={cn("rounded-[var(--radius-md)] border px-3 py-2 text-[0.82rem] transition-colors", selected ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2 hover:text-text")}>{selected ? tr(t("Selected", "Đã chọn")) : tr(t("Compare", "So sánh"))}</button>
      </div>
    </div>
  );
}

export function PlatformCatalog({ seed }: { seed: Platform[] }) {
  const { tr } = useLang();
  const router = useRouter();
  useEffect(() => { hydrateStore(); }, []);
  const approved = useApprovedPlatforms();
  const reviews = useReviews();
  const tree = categoryTree();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingModel | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [companySize, setCompanySize] = useState<CompanySize | null>(null);
  const [openSource, setOpenSource] = useState<boolean | null>(null);
  const [rai, setRai] = useState<boolean | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sort, setSort] = useState<"rating" | "reviews" | "newest" | "az">("rating");
  const [page, setPage] = useState(1);
  const [compare, setCompare] = useState<string[]>([]);

  // rating-aware list: recompute ratingAvg/reviewCount from community reviews, then filter/sort client-side.
  const withRatings = useMemo(() => [...seed, ...approved].map((p) => ({ ...p, ...effectiveRating(p, reviews) })), [seed, approved, reviews]);
  const filtered = useMemo(() => {
    let rows = withRatings.filter((p) => p.status === "published");
    if (category) rows = rows.filter((p) => p.categorySlugs.includes(category));
    if (pricing) rows = rows.filter((p) => p.pricingModel === pricing);
    if (deployment) rows = rows.filter((p) => p.deployment.includes(deployment));
    if (companySize) rows = rows.filter((p) => p.companySizeFit.includes(companySize));
    if (openSource != null) rows = rows.filter((p) => p.openSource === openSource);
    if (rai != null) rows = rows.filter((p) => p.isRaiPlatform === rai);
    if (minRating) rows = rows.filter((p) => p.ratingAvg >= minRating);
    if (search) { const q = search.toLowerCase(); rows = rows.filter((p) => (p.name + " " + p.vendorName + " " + JSON.stringify(p.shortDescription) + " " + p.features.join(" ")).toLowerCase().includes(q)); }
    rows.sort((a, b) => sort === "az" ? a.name.localeCompare(b.name) : sort === "reviews" ? b.reviewCount - a.reviewCount : sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : (b.ratingAvg - a.ratingAvg || a.name.localeCompare(b.name)));
    return rows;
  }, [withRatings, category, pricing, deployment, companySize, openSource, rai, minRating, search, sort]);

  const pageSize = 9;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * pageSize, cur * pageSize);

  function toggleCompare(slug: string) {
    setCompare((c) => c.includes(slug) ? c.filter((s) => s !== slug) : c.length >= 4 ? c : [...c, slug]);
  }

  const facetBtn = (active: boolean) => cn("rounded-[var(--radius-md)] border px-2.5 py-1 text-[0.78rem] transition-colors", active ? "border-accent bg-surface text-text" : "border-border text-text-2 hover:text-text");

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-12`}>
          <div className="accent-rule mb-4" />
          <h1 className="text-[2rem] font-medium tracking-tight text-text sm:text-[2.4rem]">{tr(t("Every platform & software, in one catalog", "Toàn bộ nền tảng & phần mềm trong một catalog"))}</h1>
          <p className="mt-3 max-w-2xl text-[1rem] text-text-2">{tr(t("Discover, compare, and review platforms — external and RAI's own. Factual, sourced, never fabricated.", "Khám phá, so sánh và đánh giá nền tảng — bên ngoài lẫn của RAI. Có dữ kiện, ghi nguồn, không bịa."))}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={tr(t("Search platforms…", "Tìm nền tảng…"))} className="w-full rounded-[var(--radius-md)] border border-border bg-bg py-2.5 pl-9 pr-3 text-[0.9rem] text-text outline-none focus:border-border-strong" />
            </div>
            <Link href="/platform/submit" className={buttonClass("primary")}><Icon name="check" size={15} />{tr(t("Add platform", "Thêm nền tảng"))}</Link>
          </div>
        </div>
      </section>

      <section className={`${WRAP} grid gap-8 py-10 lg:grid-cols-[230px_1fr]`}>
        {/* facet sidebar */}
        <aside className="space-y-6">
          <FacetGroup title={tr(t("Category", "Danh mục"))}>
            <div className="space-y-2">
              {tree.map((parent) => (
                <div key={parent.id}>
                  <div className="label text-text-2">{tr(parent.name)}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {parent.children.map((c) => <button key={c.id} onClick={() => { setCategory(category === c.slug ? null : c.slug); setPage(1); }} className={facetBtn(category === c.slug)}>{tr(c.name)}</button>)}
                  </div>
                </div>
              ))}
            </div>
          </FacetGroup>
          <FacetGroup title={tr(t("Pricing", "Mô hình giá"))}>
            <div className="flex flex-wrap gap-1">{(["free", "freemium", "paid", "contact"] as PricingModel[]).map((m) => <button key={m} onClick={() => { setPricing(pricing === m ? null : m); setPage(1); }} className={facetBtn(pricing === m)}>{tr(pricingLabels[m])}</button>)}</div>
          </FacetGroup>
          <FacetGroup title={tr(t("Deployment", "Triển khai"))}>
            <div className="flex flex-wrap gap-1">{(["cloud", "on_prem", "hybrid"] as Deployment[]).map((m) => <button key={m} onClick={() => { setDeployment(deployment === m ? null : m); setPage(1); }} className={facetBtn(deployment === m)}>{tr(deploymentLabels[m])}</button>)}</div>
          </FacetGroup>
          <FacetGroup title={tr(t("Company size", "Quy mô công ty"))}>
            <div className="flex flex-wrap gap-1">{(["startup", "sme", "enterprise"] as CompanySize[]).map((m) => <button key={m} onClick={() => { setCompanySize(companySize === m ? null : m); setPage(1); }} className={facetBtn(companySize === m)}>{tr(companySizeLabels[m])}</button>)}</div>
          </FacetGroup>
          <FacetGroup title={tr(t("Rating", "Đánh giá"))}>
            <div className="flex flex-wrap gap-1">{[4.5, 4, 3.5].map((r) => <button key={r} onClick={() => { setMinRating(minRating === r ? null : r); setPage(1); }} className={facetBtn(minRating === r)}>≥ {r}</button>)}</div>
          </FacetGroup>
          <FacetGroup title={tr(t("Source", "Nguồn"))}>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => { setOpenSource(openSource === true ? null : true); setPage(1); }} className={facetBtn(openSource === true)}>{tr(t("Open source", "Mã nguồn mở"))}</button>
              <button onClick={() => { setRai(rai === true ? null : true); setPage(1); }} className={facetBtn(rai === true)}>RAI</button>
            </div>
          </FacetGroup>
        </aside>

        {/* results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="mono text-[0.8rem] text-text-2">{filtered.length} {tr(t("platforms", "nền tảng"))}</div>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-[0.82rem] text-text">
              <option value="rating">{tr(t("Top rated", "Đánh giá cao"))}</option>
              <option value="reviews">{tr(t("Most reviewed", "Nhiều review"))}</option>
              <option value="newest">{tr(t("Newest", "Mới nhất"))}</option>
              <option value="az">A–Z</option>
            </select>
          </div>
          {shown.length === 0 ? <p className="text-[0.92rem] text-text-2">{tr(t("No platforms match the filters.", "Không có nền tảng khớp bộ lọc."))}</p> : (
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => <PlatformCard key={p.id} p={p} rating={{ ratingAvg: p.ratingAvg, reviewCount: p.reviewCount }} selected={compare.includes(p.slug)} onToggle={() => toggleCompare(p.slug)} />)}
            </div>
          )}
          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={cur <= 1} onClick={() => setPage(cur - 1)} className={buttonClass("ghost", "sm") + " disabled:opacity-40"}>{tr(t("Prev", "Trước"))}</button>
              <span className="mono text-[0.8rem] text-text-2">{cur} / {pages}</span>
              <button disabled={cur >= pages} onClick={() => setPage(cur + 1)} className={buttonClass("ghost", "sm") + " disabled:opacity-40"}>{tr(t("Next", "Sau"))}</button>
            </div>
          )}
        </div>
      </section>

      {compare.length > 0 && (
        <div className="sticky bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md">
          <div className={`${WRAP} flex items-center justify-between gap-3 py-3`}>
            <div className="mono text-[0.8rem] text-text-2">{tr(t("Comparing", "Đang so sánh"))}: {compare.join(", ")} ({compare.length}/4)</div>
            <div className="flex gap-2">
              <button onClick={() => setCompare([])} className={buttonClass("ghost", "sm")}>{tr(t("Clear", "Xóa"))}</button>
              <button onClick={() => router.push(`/platform/compare?ids=${compare.join(",")}`)} disabled={compare.length < 2} className={buttonClass("primary", "sm") + " disabled:opacity-40"}>{tr(t("Compare", "So sánh"))}<Icon name="arrow-up-right" size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="mono mb-2 text-[0.62rem] uppercase tracking-wider text-text-2/70">{title}</div>{children}</div>;
}
