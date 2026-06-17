"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { metricItemValue, type Block, type MetricCategory } from "@/lib/about";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
const GOLD = "#C9A227";

const catMeta: Record<MetricCategory, { label: { en: string; vi: string }; color: string }> = {
  aspiration: { label: t("Aspiration · MIT model", "Khát vọng · hình mẫu MIT"), color: GOLD },
  actual: { label: t("Actual · from RAI systems", "Thực tế · từ hệ thống RAI"), color: "var(--color-ok)" },
  reference: { label: t("Reference", "Tham chiếu"), color: "var(--color-text-2)" },
};

export function AboutBlock({ block }: { block: Block }) {
  const { tr } = useLang();

  switch (block.type) {
    case "hero": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-surface">
          <div className={`${WRAP} py-14 sm:py-20`}>
            {d.eyebrow && <div className="label mb-4 text-accent">{tr(d.eyebrow)}</div>}
            <div className="accent-rule mb-6" />
            <h1 className="max-w-3xl text-[2.1rem] font-medium leading-[1.1] tracking-tight text-text sm:text-[2.9rem]">{tr(d.title)}</h1>
            <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-text-2">{tr(d.subhead)}</p>
            {d.ctaLabel && d.ctaHref && <div className="mt-7"><Link href={d.ctaHref} className={buttonClass("primary", "lg")}>{tr(d.ctaLabel)}<Icon name="arrow-up-right" size={18} /></Link></div>}
          </div>
        </section>
      );
    }
    case "prose": {
      const d = block.data;
      return (
        <section className={d.accent ? "border-b border-border bg-bg" : "border-b border-border bg-surface"}>
          <div className={`${WRAP} py-12`}>
            {d.label && <div className="label mb-3" style={{ color: d.accent ? GOLD : "var(--color-accent)" }}>{tr(d.label)}</div>}
            {d.heading && <h2 className="mb-3 text-[1.5rem] font-medium tracking-tight text-text">{tr(d.heading)}</h2>}
            <p className={d.accent ? "max-w-3xl text-[1.25rem] font-medium leading-snug tracking-tight text-text" : "max-w-3xl text-[1.05rem] leading-relaxed text-text-2"}>{tr(d.body)}</p>
          </div>
        </section>
      );
    }
    case "metric_strip": {
      const d = block.data;
      const meta = catMeta[d.category];
      return (
        <section className="border-b border-border bg-surface">
          <div className={`${WRAP} py-12`}>
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2.5 rounded-[1px]" style={{ background: meta.color }} />
              <span className="label" style={{ color: meta.color }}>{tr(meta.label)}</span>
            </div>
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
              {d.items.map((it, i) => {
                const v = metricItemValue(it);
                return (
                  <div key={i} className="border border-border bg-bg p-5">
                    {v && v !== "—" ? <div className="text-[1.9rem] font-medium tracking-tight text-text">{v}</div> : null}
                    <div className={v && v !== "—" ? "mt-1 text-[0.9rem] text-text-2" : "text-[1.02rem] font-medium text-text"}>{tr(it.label)}</div>
                    {it.sub && <div className="mono mt-2 text-[0.62rem] uppercase tracking-wider text-text-2/70">{tr(it.sub)}</div>}
                  </div>
                );
              })}
            </div>
            {d.note && <p className="mt-4 max-w-3xl text-[0.84rem] italic text-text-2">{tr(d.note)}</p>}
          </div>
        </section>
      );
    }
    case "pillar_grid": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-bg">
          <div className={`${WRAP} py-14`}>
            <div className="grid gap-px sm:grid-cols-3">
              {d.items.map((it, i) => (
                <div key={i} className="border border-border bg-surface p-6">
                  <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border" style={{ color: GOLD }}><Icon name={it.icon} size={22} /></span>
                  <h3 className="mt-4 text-[1.15rem] font-medium text-text">{tr(it.title)}</h3>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-text-2">{tr(it.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "entity_grid": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-surface">
          <div className={`${WRAP} py-12`}>
            <h2 className="mb-6 text-[1.4rem] font-medium tracking-tight text-text">{tr(t("Ecosystem entities", "Các thực thể hệ sinh thái"))}</h2>
            <div className="grid gap-px sm:grid-cols-3">
              {d.items.map((it, i) => {
                const inner = (
                  <>
                    <div className="flex items-center gap-2"><span className="size-2.5 rounded-[1px]" style={{ background: it.color }} /><h3 className="font-medium text-text">{it.name}</h3></div>
                    <p className="mt-2 text-[0.9rem] text-text-2">{tr(it.body)}</p>
                  </>
                );
                return it.href
                  ? <Link key={i} href={it.href} className="border border-border bg-bg p-5 transition-colors hover:border-border-strong">{inner}</Link>
                  : <div key={i} className="border border-border bg-bg p-5">{inner}</div>;
              })}
            </div>
          </div>
        </section>
      );
    }
    case "steps": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-bg">
          <div className={`${WRAP} py-12`}>
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-5">
              {d.steps.map((s, i) => (
                <div key={i} className="border border-border bg-surface p-5">
                  <div className="mono text-[0.72rem] text-text-2">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mt-2 text-[1rem] font-medium text-text">{tr(s.title)}</h3>
                  <p className="mt-2 text-[0.86rem] text-text-2">{tr(s.body)}</p>
                </div>
              ))}
            </div>
            {d.note && <p className="mt-4 max-w-3xl text-[0.9rem] italic text-text-2">{tr(d.note)}</p>}
          </div>
        </section>
      );
    }
    case "timeline": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-surface">
          <div className={`${WRAP} py-12`}>
            <div className="border-l border-border pl-6">
              {d.items.map((it, i) => (
                <div key={i} className="relative pb-8 last:pb-0">
                  <span className="absolute -left-[1.6rem] top-1 size-3 rounded-full border-2 border-accent bg-bg" />
                  <div className="mono text-[0.72rem] uppercase tracking-wider text-accent">{it.date}</div>
                  <h3 className="mt-1 text-[1.05rem] font-medium text-text">{tr(it.title)}</h3>
                  <p className="mt-1 text-[0.9rem] text-text-2">{tr(it.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "leaders_grid": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-bg">
          <div className={`${WRAP} py-12`}>
            <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {d.items.map((it, i) => (
                <div key={i} className="border border-border bg-surface p-6">
                  <div className="grid size-12 place-items-center rounded-full border border-border text-text-2"><Icon name="user" size={22} /></div>
                  <h3 className="mt-4 text-[1.05rem] font-medium text-text">{it.name}</h3>
                  <div className="text-[0.86rem] text-accent">{tr(it.role)}</div>
                  {it.bio && <p className="mt-2 text-[0.88rem] text-text-2">{tr(it.bio)}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "partners_grid": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-surface">
          <div className={`${WRAP} py-12`}>
            <div className="grid gap-8 sm:grid-cols-2">
              {d.groups.map((g, i) => (
                <div key={i}>
                  <div className="label mb-3 text-text-2">{tr(g.title)}</div>
                  <div className="flex flex-wrap gap-2">
                    {g.names.map((n) => <span key={n} className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.86rem] text-text">{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "reference": {
      const d = block.data;
      return (
        <section className="border-b border-border bg-bg">
          <div className={`${WRAP} py-12`}>
            <div className="border border-border bg-surface p-6 sm:p-8">
              <div className="label mb-3" style={{ color: catMeta.reference.color }}>{tr(catMeta.reference.label)} · MIT</div>
              <p className="max-w-3xl text-[1.05rem] leading-relaxed text-text">{tr(d.body)}</p>
              <p className="mt-3 text-[0.84rem] italic text-text-2">{tr(d.source)}</p>
              {d.sourceUrl && <a href={d.sourceUrl} target="_blank" rel="noreferrer" className="mono mt-2 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-accent">{tr(t("Source", "Nguồn"))}<Icon name="arrow-up-right" size={13} /></a>}
            </div>
          </div>
        </section>
      );
    }
    case "contact": {
      const d = block.data;
      const rows: { icon: string; label: string; val: string; href?: string }[] = [
        { icon: "mail", label: tr(t("Email", "Email")), val: d.email, href: `mailto:${d.email}` },
        { icon: "message", label: tr(t("Phone", "Điện thoại")), val: d.phone, href: `tel:${d.phone.replace(/\s/g, "")}` },
        { icon: "building", label: tr(t("Office", "Văn phòng")), val: tr(d.address) },
      ];
      return (
        <section className="border-b border-border bg-bg">
          <div className={`${WRAP} py-12`}>
            <div className="grid gap-px sm:grid-cols-3">
              {rows.map((r) => (
                <div key={r.label} className="border border-border bg-surface p-5">
                  <Icon name={r.icon} size={20} className="text-accent" />
                  <div className="label mt-3 text-text-2">{r.label}</div>
                  {r.href ? <a href={r.href} className="mt-1 block text-[0.95rem] text-text hover:text-accent">{r.val}</a> : <div className="mt-1 text-[0.95rem] text-text">{r.val}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "cta_band": {
      const d = block.data;
      return (
        <section className="bg-fund">
          <div className={`${WRAP} py-14 text-center`}>
            <h2 className="text-[1.7rem] font-medium tracking-tight text-white">{tr(d.title)}</h2>
            {d.body && <p className="mx-auto mt-3 max-w-xl text-[1rem] text-white/80">{tr(d.body)}</p>}
            <div className="mt-7"><Link href={d.ctaHref} className={buttonClass("outline", "lg") + " !bg-white !text-fund !border-white"}>{tr(d.ctaLabel)}<Icon name="arrow-up-right" size={18} /></Link></div>
          </div>
        </section>
      );
    }
  }
}

export function AboutView({ blocks }: { blocks: Block[] }) {
  return <main>{blocks.map((b, i) => <AboutBlock key={i} block={b} />)}</main>;
}
