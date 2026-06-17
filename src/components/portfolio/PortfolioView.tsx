"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { pillarColor, pillarLabels, pillarBlurb, stageLabels, tabLabels, tabOrder, tabPillars, reservedDomains, type PortfolioEntry, type PortfolioTab } from "@/lib/portfolio";
import { effectiveList, hydrateStore, useNewEntries, useOverridesMap } from "@/lib/portfolio-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";
const tabRoute: Record<PortfolioTab, string> = { platforms: "/portfolio/platforms", companies: "/portfolio/companies", investments: "/portfolio/investments" };

function EntryCard({ e }: { e: PortfolioEntry }) {
  const { tr } = useLang();
  const tier = e.pricingTiers[0];
  return (
    <div className="flex flex-col border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-[var(--radius-md)] text-[0.8rem] font-medium text-white" style={{ background: e.accent }}>{e.monogram}</span>
        <span className="mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.56rem] uppercase tracking-wider text-white" style={{ background: pillarColor[e.pillar] }}>{tr(pillarLabels[e.pillar])}</span>
      </div>
      <Link href={`/portfolio/${e.slug}`} className="mt-3 text-[1.05rem] font-medium text-text hover:text-accent">{e.name}</Link>
      {e.legalName ? <div className="mono text-[0.68rem] text-text-2">{e.legalName}</div> : e.domain ? <div className="mono text-[0.72rem] text-text-2">{e.domain}</div> : null}
      <p className="mt-1 line-clamp-2 text-[0.86rem] text-text-2">{tr(e.tagline)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-[var(--radius-md)] border border-border px-2 py-0.5 text-[0.72rem] text-text-2">{e.sector}</span>
        <span className="mono rounded-[var(--radius-md)] bg-bg px-2 py-0.5 text-[0.62rem] uppercase tracking-wider text-text-2">{tr(stageLabels[e.stage])}</span>
      </div>
      {tier && <div className="mt-3 text-[0.82rem] text-text-2"><span className="text-text">{tr(tier.name)}</span>: {tr(tier.price)} <span className="text-text-2/60">· {tr(t("est.", "dự kiến"))}</span></div>}
      <div className="mt-4 flex items-center gap-2">
        <Link href={`/portfolio/${e.slug}`} className="rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 py-2 text-[0.82rem] text-text transition-colors hover:border-text">{tr(t("View profile", "Xem hồ sơ"))}</Link>
        {e.domain && <a href={`https://${e.domain.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="mono inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-accent">{tr(t("Visit", "Truy cập"))}<Icon name="arrow-up-right" size={12} /></a>}
      </div>
    </div>
  );
}

function Grid({ items }: { items: PortfolioEntry[] }) {
  return <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">{items.map((e) => <EntryCard key={e.id} e={e} />)}</div>;
}

export function PortfolioView({ seed, tab = "all" }: { seed: PortfolioEntry[]; tab?: PortfolioTab | "all" }) {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  useNewEntries(); useOverridesMap();
  const [sector, setSector] = useState<string>("all");
  const [q, setQ] = useState("");

  const all = useMemo(() => effectiveList(seed).filter((e) => e.status === "published"), [seed]);
  const stats = useMemo(() => ({
    platforms: all.filter((e) => e.entryType === "platform").length,
    companies: all.filter((e) => e.entryType === "company").length,
    investments: all.filter((e) => e.entryType === "investment").length,
  }), [all]);

  const tabsToRender = tab === "all" ? tabOrder : [tab];
  const scope = useMemo(() => (tab === "all" ? all : all.filter((e) => e.portfolioTab === tab)), [all, tab]);
  const sectors = useMemo(() => Array.from(new Set(scope.map((e) => e.sector))), [scope]);
  const filtered = useMemo(() => scope.filter((e) =>
    (sector === "all" || e.sector === sector) &&
    (!q || (e.name + " " + (e.domain ?? "") + " " + e.sector + " " + (e.legalName ?? "")).toLowerCase().includes(q.toLowerCase()))
  ), [scope, sector, q]);

  const statCards: { tab: PortfolioTab; n: number }[] = [{ tab: "platforms", n: stats.platforms }, { tab: "companies", n: stats.companies }, { tab: "investments", n: stats.investments }];

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-12`}>
          <div className="accent-rule mb-4" />
          <h1 className="text-[2rem] font-medium tracking-tight text-text sm:text-[2.5rem]">{tab === "all" ? tr(t("The RAI Holdings ecosystem", "Hệ sinh thái RAI Holdings")) : tr(tabLabels[tab])}</h1>
          <p className="mt-3 max-w-2xl text-[1rem] text-text-2">{tr(t("Platforms RAI builds and operates, member companies, and the investment portfolio — across five strategic pillars.", "Các nền tảng RAI tự xây & vận hành, công ty thành viên và danh mục đầu tư — trên năm trụ cột chiến lược."))}</p>
          <div className="mt-6 grid grid-cols-3 gap-px border border-border">
            {statCards.map((s) => (
              <Link key={s.tab} href={tabRoute[s.tab]} className={cn("bg-bg px-4 py-4 transition-colors hover:bg-surface", tab === s.tab && "bg-surface")}>
                <div className="text-[1.6rem] font-medium tracking-tight text-text">{s.n}</div>
                <div className="text-[0.8rem] text-text-2">{tr(tabLabels[s.tab])}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${WRAP} py-8`}>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tab !== "all" && <Link href="/portfolio" className="mono text-[0.72rem] uppercase tracking-wider text-accent">{tr(t("All", "Tất cả"))} ·</Link>}
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-[0.82rem] text-text">
            <option value="all">{tr(t("All sectors", "Tất cả lĩnh vực"))}</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative ml-auto">
            <Icon name="search" size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(t("Search", "Tìm kiếm"))} className="w-44 rounded-[var(--radius-md)] border border-border bg-surface py-1.5 pl-8 pr-3 text-[0.84rem] text-text outline-none focus:border-border-strong" />
          </div>
        </div>

        {tabsToRender.map((tb) => {
          const items = filtered.filter((e) => e.portfolioTab === tb);
          if (items.length === 0) return tab === "all" ? null : <p key={tb} className="text-[0.92rem] text-text-2">{tr(t("No entries match.", "Không có mục phù hợp."))}</p>;
          const groups = tb === "platforms"
            ? tabPillars.platforms.map((p) => ({ pillar: p, items: items.filter((e) => e.pillar === p) })).filter((g) => g.items.length > 0)
            : null;
          return (
            <div key={tb} className="mb-12">
              {tab === "all" && <div className="mb-5 flex items-center gap-2 border-b border-border pb-2"><h2 className="text-[1.2rem] font-medium tracking-tight text-text">{tr(tabLabels[tb])}</h2><Link href={tabRoute[tb]} className="mono text-[0.66rem] uppercase tracking-wider text-accent">{tr(t("Open", "Mở"))} →</Link></div>}
              {groups ? (
                <div className="space-y-8">
                  {groups.map((g) => (
                    <div key={g.pillar}>
                      <div className="mb-1 flex items-center gap-2"><span className="size-2.5 rounded-[1px]" style={{ background: pillarColor[g.pillar] }} /><h3 className="label text-text">{tr(pillarLabels[g.pillar])}</h3><span className="mono text-[0.7rem] text-text-2">· {g.items.length}</span></div>
                      <p className="mb-3 text-[0.82rem] text-text-2">{tr(pillarBlurb[g.pillar])}</p>
                      <Grid items={g.items} />
                    </div>
                  ))}
                </div>
              ) : <Grid items={items} />}
            </div>
          );
        })}

        {(tab === "all" || tab === "platforms") && (
          <div className="mt-2 border-t border-border pt-4">
            <div className="mono mb-2 text-[0.62rem] uppercase tracking-wider text-text-2/70">{tr(t("Reserved domains (not yet mapped)", "Domain đã giữ (chưa gắn nền tảng)"))}</div>
            <div className="flex flex-wrap gap-2">{reservedDomains.map((d) => <span key={d} className="mono rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.74rem] text-text-2">{d}</span>)}</div>
          </div>
        )}
      </section>
    </main>
  );
}
