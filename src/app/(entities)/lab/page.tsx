"use client";

import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import {
  LAB, labContact, labHero, labLayers, labMetrics, labVerticals, pricing,
  principles, roadmapProducts, security, statusMeta, useCases,
  type LabLayer, type LabProduct, type PriceTier, type UseCase,
} from "@/lib/lab";

const sectionNav: { id: string; label: T }[] = [
  { id: "arch", label: t("Architecture", "Kiến trúc") },
  { id: "principles", label: t("Principles", "Nguyên tắc") },
  { id: "pricing", label: t("Pricing", "Bảng giá") },
  { id: "usecases", label: t("Use cases", "Tình huống ứng dụng") },
  { id: "verticals", label: t("Verticals", "Ngành dọc") },
  { id: "security", label: t("Security", "Bảo mật") },
];

export default function RaiLabPage() {
  const { tr } = useLang();

  return (
    <div>
      {/* hero */}
      <header className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="p-8 sm:p-12" style={{ borderTop: `3px solid ${LAB}` }}>
          <span className="mono text-[0.72rem] text-text-2">{labHero.docId}</span>
          <div className="mt-3 flex items-center gap-3">
            <span className="accent-rule" style={{ color: LAB }} />
            <span className="label" style={{ color: LAB }}>{tr(labHero.eyebrow)}</span>
          </div>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.07] text-text">
            {tr(labHero.title)}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] text-text-2">{tr(labHero.subtitle)}</p>
          <blockquote className="mt-6 max-w-2xl border-l-2 pl-4 text-[1.05rem] italic text-text" style={{ borderColor: LAB }}>
            “{tr(labHero.quote)}”
          </blockquote>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#arch" className={buttonClass("primary", "lg")} style={{ background: LAB, borderColor: LAB }}>
              {tr(labHero.ctaPrimary)} <Icon name="arrow-up-right" size={18} />
            </a>
            <a href="#contact" className={buttonClass("outline", "lg")}>{tr(labHero.ctaSecondary)}</a>
          </div>
        </div>
        {/* metrics */}
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          {labMetrics.map((m) => (
            <div key={m.value} className="bg-surface px-5 py-6 text-center">
              <div className="font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.6vw,1.9rem)] font-medium" style={{ color: LAB }}>{m.value}</div>
              <div className="mono mt-1.5 text-[0.66rem] uppercase tracking-wide text-text-2">{tr(m.label)}</div>
            </div>
          ))}
        </div>
      </header>

      {/* section nav */}
      <nav className="sticky top-2 z-10 mt-6 flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-border bg-surface/90 p-2 backdrop-blur">
        {sectionNav.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="mono rounded-[var(--radius-sm)] px-3 py-1.5 text-[0.74rem] text-text-2 transition-colors hover:bg-bg hover:text-text">
            {tr(s.label)}
          </a>
        ))}
      </nav>

      {/* architecture — 4 core layers */}
      <section id="arch" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Technology architecture", "Kiến trúc công nghệ")} title={t("Four core technology layers", "Bốn lớp công nghệ lõi")} />
        <p className="mb-5 max-w-2xl text-[0.95rem] text-text-2">
          {tr(t("Layered by design — each layer runs and scales independently, with a REST API + Python/Node SDK. Use one layer or the whole stack.", "Thiết kế phân lớp — mỗi lớp vận hành & scale độc lập, có REST API + SDK Python/Node. Dùng riêng từng lớp hoặc cả stack."))}
        </p>
        <div className="grid gap-3">
          {labLayers.map((l) => <LayerCard key={l.code} layer={l} />)}
        </div>

        {/* roadmap */}
        <div className="mt-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-5">
          <span className="mono text-[0.7rem] uppercase tracking-wide text-text-2">{tr(t("Roadmap 2027–2028", "Lộ trình 2027–2028"))}</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadmapProducts.map((p) => (
              <div key={p.name} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <div className="font-[family-name:var(--font-display)] text-[0.92rem] font-medium text-text">{p.name}</div>
                <div className="mt-0.5 text-[0.78rem] text-text-2">{tr(p.role)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* principles */}
      <section id="principles" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Technology vision", "Tầm nhìn công nghệ")} title={t("Four engineering principles", "Bốn nguyên tắc kỹ thuật")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <div key={p.n} className="bg-surface p-6">
              <span className="mono text-[0.9rem] font-medium" style={{ color: LAB }}>{p.n}</span>
              <h3 className="mt-2 text-[1.02rem] leading-snug text-text">{tr(p.title)}</h3>
              <p className="mt-2 text-[0.85rem] text-text-2">{tr(p.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Pricing & packages", "Pricing & gói dịch vụ")} title={t("Four tiers, from free to enterprise", "Bốn tier, từ free đến enterprise")} />
        <div className="grid gap-4 lg:grid-cols-4">
          {pricing.map((tier) => <PriceCard key={tier.name} tier={tier} />)}
        </div>
      </section>

      {/* use cases */}
      <section id="usecases" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Use cases", "Tình huống ứng dụng")} title={t("Top use cases by measured ROI", "Use cases hàng đầu theo ROI")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u) => <UseCaseCard key={u.stack} u={u} />)}
        </div>
      </section>

      {/* verticals */}
      <section id="verticals" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Industries", "Ngành dọc")} title={t("Six verticals with pre-built solutions", "Sáu ngành dọc có giải pháp dựng sẵn")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {labVerticals.map((v) => (
            <div key={tr(v.name)} className="bg-surface p-6">
              <span className="accent-rule mb-3" style={{ color: LAB }} />
              <h3 className="text-[1.02rem] text-text">{tr(v.name)}</h3>
              <p className="mt-2 text-[0.85rem] text-text-2">{tr(v.caps)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* security */}
      <section id="security" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Security, compliance & SLA", "An ninh, tuân thủ & SLA")} title={t("Enterprise-grade trust", "Chuẩn tin cậy doanh nghiệp")} />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <ul className="grid gap-3">
              {security.items.map((it, i) => (
                <li key={i} className="flex items-start gap-3 text-[0.9rem] text-text">
                  <span className="mt-0.5 flex-none" style={{ color: LAB }}><Icon name="check" size={16} /></span>
                  {tr(it)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <ul className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-border bg-border">
              {security.certs.map((c) => (
                <li key={c.name} className="flex items-center justify-between bg-surface px-4 py-3">
                  <span className="text-[0.9rem] font-medium text-text">{c.name}</span>
                  <span className="mono text-[0.74rem] text-text-2">{tr(c.status)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border p-8 text-center sm:flex-row sm:text-left" style={{ background: LAB }}>
        <div>
          <h2 className="text-[clamp(1.3rem,2.6vw,1.9rem)] text-white">{tr(labContact.title)}</h2>
          <p className="mt-2 text-[0.95rem] text-white/80">{tr(labContact.body)}</p>
        </div>
        <a href={`mailto:${labContact.email}`} className="flex-none rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-[0.92rem] font-medium transition-colors hover:bg-white/90" style={{ color: LAB }}>
          {tr(labContact.cta)}
        </a>
      </section>
    </div>
  );
}

/* ----------------------------- subcomponents ---------------------------- */
function SectionTitle({ label, title }: { label: T; title: T }) {
  const { tr } = useLang();
  return (
    <div className="mb-5">
      <span className="accent-rule mb-3" style={{ color: LAB }} />
      <span className="label text-text-2">{tr(label)}</span>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.8vw,2rem)] font-medium text-text">{tr(title)}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: LabProduct["status"] }) {
  const { tr } = useLang();
  const m = statusMeta[status];
  return (
    <span className="mono inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem] uppercase" style={{ color: m.tone, background: `color-mix(in srgb, ${m.tone} 12%, transparent)` }}>
      <span className="size-1.5 rounded-full" style={{ background: m.tone }} />
      {tr(m.label)}
    </span>
  );
}

function LayerCard({ layer }: { layer: LabLayer }) {
  const { tr } = useLang();
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: LAB, background: `color-mix(in srgb, ${LAB} 12%, transparent)` }}>
          <Icon name={layer.icon} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="mono text-[0.74rem] font-medium" style={{ color: LAB }}>{layer.code}</span>
            <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{tr(layer.name)}</h3>
          </div>
          <p className="mt-1 text-[0.86rem] text-text-2">{tr(layer.desc)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {layer.products.map((p) => (
          <div key={p.name} className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-bg p-3">
            <div className="min-w-0">
              <div className="font-[family-name:var(--font-display)] text-[0.92rem] font-medium text-text">{p.name}</div>
              <div className="mt-0.5 text-[0.78rem] text-text-2">{tr(p.role)}</div>
            </div>
            <StatusBadge status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceCard({ tier }: { tier: PriceTier }) {
  const { tr } = useLang();
  return (
    <div className="flex flex-col rounded-[var(--radius-lg)] border bg-surface p-6" style={tier.featured ? { borderColor: LAB, borderWidth: 2 } : undefined}>
      {tier.featured && <span className="mono mb-2 self-start rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.64rem] uppercase text-white" style={{ background: LAB }}>{tr(t("Popular", "Phổ biến"))}</span>}
      <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{tier.name}</h3>
      <div className="mt-1 text-[1.1rem] font-medium" style={{ color: LAB }}>{tr(tier.price)}</div>
      <p className="mt-2 text-[0.82rem] text-text-2">{tr(tier.blurb)}</p>
      <ul className="mt-4 grid flex-1 gap-2 border-t border-border pt-4">
        {tier.specs.map((s, i) => (
          <li key={i} className="flex items-baseline justify-between gap-2 text-[0.82rem]">
            <span className="text-text-2">{tr(s.k)}</span>
            <span className="mono text-text">{s.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UseCaseCard({ u }: { u: UseCase }) {
  const { tr } = useLang();
  return (
    <div className="bg-surface p-6">
      <h3 className="text-[1rem] font-medium text-text">{tr(u.name)}</h3>
      <div className="mono mt-2 text-[0.74rem] text-text-2">{u.stack}</div>
      <div className="mt-3 inline-flex rounded-[var(--radius-sm)] px-2 py-1 text-[0.8rem]" style={{ color: LAB, background: `color-mix(in srgb, ${LAB} 10%, transparent)` }}>
        {tr(u.roi)}
      </div>
    </div>
  );
}
