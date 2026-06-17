"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { pillarColor, pillarLabels, stageLabels, tabLabels, type ContentBlock, type PortfolioEntry, type ProfileBlock, type Stage } from "@/lib/portfolio";
import { effectiveEntry, hydrateStore, newEntryBySlug, useNewEntries, useOverride } from "@/lib/portfolio-store";

const WRAP = "mx-auto max-w-[960px] px-5 sm:px-8";

function BlockView({ block }: { block: ContentBlock }) {
  const { tr } = useLang();
  const d = block.data as ProfileBlock["data"];
  switch (block.type) {
    case "overview":
      return <Section title={tr(t("Overview", "Tổng quan"))}><p className="max-w-3xl text-[1.02rem] leading-relaxed text-text-2">{tr((d as { body: { en: string; vi: string } }).body)}</p></Section>;
    case "models": {
      const items = (d as { items: { en: string; vi: string }[] }).items;
      return <Section title={tr(t("Business models", "Mô hình kinh doanh"))}><ul className="flex flex-wrap gap-2">{items.map((m, i) => <li key={i} className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-[0.88rem] text-text">{tr(m)}</li>)}</ul></Section>;
    }
    case "pricing_table": {
      const pt = d as { estimated: boolean; tiers: { name: { en: string; vi: string }; price: { en: string; vi: string } }[] };
      if (!pt.tiers.length) return null;
      return <Section title={tr(t("Pricing", "Gói giá"))} note={pt.estimated ? tr(t("Estimated — subject to change", "Dự kiến — có thể thay đổi")) : undefined}>
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">{pt.tiers.map((ti, i) => <div key={i} className="border border-border bg-surface p-4"><div className="font-medium text-text">{tr(ti.name)}</div><div className="mt-1 text-[0.92rem] text-accent">{tr(ti.price)}</div></div>)}</div>
      </Section>;
    }
    case "use_cases": {
      const items = (d as { items: { title: { en: string; vi: string }; description: { en: string; vi: string } }[] }).items;
      return <Section title={tr(t("Use cases", "Ứng dụng"))}><div className="grid gap-px sm:grid-cols-2">{items.map((u, i) => <div key={i} className="border border-border bg-surface p-5"><h3 className="font-medium text-text">{tr(u.title)}</h3><p className="mt-1 text-[0.88rem] text-text-2">{tr(u.description)}</p></div>)}</div></Section>;
    }
    case "ecosystem_links": {
      const items = (d as { items: { label: { en: string; vi: string }; href: string }[] }).items;
      return <Section title={tr(t("In the RAI ecosystem", "Trong hệ sinh thái RAI"))}><div className="flex flex-wrap gap-2">{items.map((it, i) => <Link key={i} href={it.href} className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-[0.88rem] text-text transition-colors hover:border-border-strong">{tr(it.label)}<Icon name="arrow-up-right" size={13} className="text-text-2" /></Link>)}</div></Section>;
    }
    case "status": {
      const st = d as { stage: Stage; note?: { en: string; vi: string } };
      return <Section title={tr(t("Status", "Trạng thái"))}><div className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2"><span className="size-2 rounded-full bg-warn" /><span className="text-[0.9rem] text-text">{tr(stageLabels[st.stage])}</span></div>{st.note && <p className="mt-2 text-[0.82rem] italic text-text-2">{tr(st.note)}</p>}</Section>;
    }
    case "contact_cta": {
      const c = d as { title: { en: string; vi: string }; ctaLabel: { en: string; vi: string }; ctaHref: string };
      return <section className="bg-fund"><div className={`${WRAP} py-12 text-center`}><h2 className="text-[1.5rem] font-medium tracking-tight text-white">{tr(c.title)}</h2><div className="mt-6"><Link href={c.ctaHref} className={buttonClass("outline", "lg") + " !bg-white !text-fund !border-white"}>{tr(c.ctaLabel)}<Icon name="arrow-up-right" size={18} /></Link></div></div></section>;
    }
    default: return null;
  }
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return <section className="border-b border-border bg-bg"><div className={`${WRAP} py-10`}><div className="mb-4 flex items-center gap-3"><h2 className="text-[1.3rem] font-medium tracking-tight text-text">{title}</h2>{note && <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-warn">{note}</span>}</div>{children}</div></section>;
}

export function ProfileView({ slug, seed }: { slug: string; seed: PortfolioEntry | null }) {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  useOverride(seed?.id ?? "__none__");
  useNewEntries();
  const e = seed ? effectiveEntry(seed) : newEntryBySlug(slug) ?? null;
  if (!e) return <main className={`${WRAP} py-20 text-center`}><p className="text-text-2">{tr(t("Entry not found.", "Không tìm thấy mục."))}</p><Link href="/portfolio" className="mono mt-4 inline-block text-[0.8rem] uppercase tracking-wider text-accent">{tr(t("Back to portfolio", "Về danh mục"))}</Link></main>;
  const blocks = [...e.blocks].filter((b) => b.status === "published").sort((a, b) => a.order - b.order);

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-12`}>
          <Link href="/portfolio" className="mono mb-6 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-text-2 hover:text-text"><Icon name="arrow-up-right" size={13} className="rotate-180" />{tr(t("Portfolio", "Danh mục"))}</Link>
          <div className="flex flex-wrap items-start gap-4">
            <span className="grid size-14 place-items-center rounded-[var(--radius-md)] text-[1.1rem] font-medium text-white" style={{ background: e.accent }}>{e.monogram}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-white" style={{ background: pillarColor[e.pillar] }}>{tr(pillarLabels[e.pillar])}</span>
                <span className="mono rounded-[var(--radius-md)] border border-border px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-text-2">{tr(tabLabels[e.portfolioTab])}</span>
                <span className="mono rounded-[var(--radius-md)] bg-bg px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-text-2">{tr(stageLabels[e.stage])}</span>
              </div>
              <h1 className="mt-2 text-[1.9rem] font-medium tracking-tight text-text">{e.name}</h1>
              {e.legalName && <div className="mono mt-1 text-[0.76rem] text-text-2">{e.legalName}</div>}
              <p className="mt-2 max-w-2xl text-[1rem] text-text-2">{tr(e.tagline)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-[var(--radius-md)] border border-border px-2 py-0.5 text-[0.78rem] text-text-2">{e.sector}</span>
                {e.domain && <a href={`https://${e.domain.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className={buttonClass("outline", "sm")}>{tr(t("Visit platform", "Truy cập nền tảng"))}<Icon name="arrow-up-right" size={14} /></a>}
              </div>
            </div>
          </div>
        </div>
      </section>
      {blocks.map((b) => <BlockView key={b.id} block={b} />)}
    </main>
  );
}
