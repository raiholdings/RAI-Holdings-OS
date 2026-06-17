"use client";

import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { oneAi, oneCategories, oneCount, oneHero, type OneCategory, type OneProduct } from "@/lib/content";
import { useLang, t } from "@/lib/i18n";

export default function RaiOnePage() {
  const { tr } = useLang();

  return (
    <div>
      {/* hero */}
      <header className="rounded-[var(--radius-lg)] border border-border bg-surface p-8 sm:p-12">
        <span className="label text-text-2">{tr(oneHero.eyebrow)}</span>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.08] text-text">
          {tr(oneHero.title)}
        </h1>
        <p className="mt-4 max-w-2xl text-[1.05rem] text-text-2">{tr(oneHero.subtitle)}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a href="#L1" className={buttonClass("primary", "lg")}>{tr(oneHero.ctaPrimary)} <Icon name="arrow-up-right" size={18} /></a>
          <a href="#one-ai" className={buttonClass("outline", "lg")}>{tr(oneHero.ctaSecondary)}</a>
          <span className="mono ml-auto text-[0.74rem] text-text-2">{oneCount} PRODUCTS · 6 LAYERS</span>
        </div>

        {/* category quick-nav */}
        <nav className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
          {oneCategories.map((c) => (
            <a key={c.code} href={`#${c.code}`} className="mono inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 py-1.5 text-[0.74rem] text-text-2 transition-colors hover:border-text hover:text-text">
              <span className="size-2 rounded-[1px]" style={{ background: c.color }} />
              {c.code} · {tr(c.name)}
            </a>
          ))}
        </nav>
      </header>

      {/* category sections */}
      {oneCategories.map((cat) => (
        <CategoryBlock key={cat.code} cat={cat} />
      ))}

      {/* AI band */}
      <section id="one-ai" className="mt-12 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="accent-rule mb-4 text-accent" />
            <h2 className="max-w-md font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2.2rem)] font-medium text-text">{tr(oneAi.title)}</h2>
            <p className="mt-4 max-w-md text-[1rem] text-text-2">{tr(oneAi.body)}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["sparkles", "robot", "cpu", "bolt", "database", "shield", "world", "stack"].map((ic, i) => (
              <span key={i} className="grid aspect-square place-items-center rounded-[var(--radius-md)] border border-border text-text-2">
                <Icon name={ic} size={20} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-accent p-8 text-center sm:flex-row sm:text-left">
        <h2 className="text-[clamp(1.3rem,2.6vw,1.8rem)] text-white">{tr(t("Deploy the suite to your venture.", "Triển khai bộ sản phẩm cho doanh nghiệp của bạn."))}</h2>
        <a href="/app" className="flex-none rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-[0.92rem] font-medium text-accent transition-colors hover:bg-white/90">
          {tr(t("Open console", "Mở console"))}
        </a>
      </section>
    </div>
  );
}

function CategoryBlock({ cat }: { cat: OneCategory }) {
  const { tr } = useLang();
  return (
    <section id={cat.code} className="mt-12 scroll-mt-24">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="accent-rule" style={{ color: cat.color }} />
        <span className="mono text-[0.74rem] font-medium" style={{ color: cat.color }}>{cat.code}</span>
        <h2 className="font-[family-name:var(--font-display)] text-[1.4rem] font-medium text-text">{tr(cat.name)}</h2>
        <span className="text-[0.9rem] text-text-2">· {tr(cat.tagline)}</span>
      </div>
      <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {cat.products.map((p) => (
          <ProductCard key={p.name} p={p} color={cat.color} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ p, color }: { p: OneProduct; color: string }) {
  const { tr } = useLang();
  return (
    <a href="#" className="group flex items-start gap-4 bg-surface p-5 transition-colors hover:bg-bg">
      <span
        className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]"
        style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
      >
        <Icon name={p.icon} size={22} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-[family-name:var(--font-display)] text-[0.98rem] font-medium text-text">
          {p.name}
          <Icon name="arrow-up-right" size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-1 block text-[0.84rem] leading-snug text-text-2">{tr(p.desc)}</span>
      </span>
    </a>
  );
}
