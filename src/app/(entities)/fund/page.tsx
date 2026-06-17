"use client";

import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import {
  FUND, criteria, founderCompare, fundContact, fundHero, fundMetrics, funds,
  lpTerms, process, streams, thesis,
  type CriteriaGroup, type Fund, type Stream,
} from "@/lib/fund";

const sectionNav: { id: string; label: T }[] = [
  { id: "thesis", label: t("Thesis", "Luận đề") },
  { id: "funds", label: t("Funds", "Các quỹ") },
  { id: "criteria", label: t("Criteria", "Tiêu chí") },
  { id: "process", label: t("Process", "Quy trình") },
  { id: "founders", label: t("Founders", "Founder") },
  { id: "returns", label: t("Returns", "Hoàn vốn") },
  { id: "lps", label: t("LPs", "LP") },
];

export default function RaiFundPage() {
  const { tr } = useLang();

  return (
    <div>
      {/* hero */}
      <header className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="p-8 sm:p-12" style={{ borderTop: `3px solid ${FUND}` }}>
          <span className="mono text-[0.72rem] text-text-2">{fundHero.docId}</span>
          <div className="mt-3 flex items-center gap-3">
            <span className="accent-rule" style={{ color: FUND }} />
            <span className="label" style={{ color: FUND }}>{tr(fundHero.eyebrow)}</span>
          </div>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.07] text-text">
            {tr(fundHero.title)}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] text-text-2">{tr(fundHero.subtitle)}</p>
          <blockquote className="mt-6 max-w-2xl border-l-2 pl-4 text-[1.05rem] italic text-text" style={{ borderColor: FUND }}>
            “{tr(fundHero.quote)}”
          </blockquote>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#lps" className={buttonClass("primary", "lg")} style={{ background: FUND, borderColor: FUND }}>
              {tr(fundHero.ctaPrimary)} <Icon name="arrow-up-right" size={18} />
            </a>
            <a href="#contact" className={buttonClass("outline", "lg")}>{tr(fundHero.ctaSecondary)}</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          {fundMetrics.map((m) => (
            <div key={m.value} className="bg-surface px-5 py-6 text-center">
              <div className="font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.6vw,1.9rem)] font-medium" style={{ color: FUND }}>{m.value}</div>
              <div className="mono mt-1.5 text-[0.66rem] uppercase tracking-wide text-text-2">{tr(m.label)}</div>
            </div>
          ))}
        </div>
      </header>

      {/* section nav */}
      <nav className="sticky top-2 z-10 mt-6 flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-border bg-surface/90 p-2 backdrop-blur">
        {sectionNav.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="mono rounded-[var(--radius-sm)] px-3 py-1.5 text-[0.74rem] text-text-2 transition-colors hover:bg-bg hover:text-text">{tr(s.label)}</a>
        ))}
      </nav>

      {/* thesis */}
      <section id="thesis" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Investment thesis", "Luận đề đầu tư")} title={t("Four pillars behind every decision", "Bốn trụ cột sau mọi quyết định")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {thesis.map((p) => (
            <div key={p.n} className="bg-surface p-6">
              <span className="mono text-[0.9rem] font-medium" style={{ color: FUND }}>{p.n}</span>
              <h3 className="mt-2 text-[1.02rem] leading-snug text-text">{tr(p.title)}</h3>
              <p className="mt-2 text-[0.85rem] text-text-2">{tr(p.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* funds */}
      <section id="funds" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Fund structure", "Cấu trúc quỹ")} title={t("Four permanent funds", "Bốn quỹ thường trực")} />
        <div className="grid gap-4 sm:grid-cols-2">
          {funds.map((f) => <FundCard key={f.code} f={f} />)}
        </div>
      </section>

      {/* criteria */}
      <section id="criteria" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Investment criteria", "Tiêu chí đầu tư")} title={t("Objective, quantified filters", "Bộ lọc định lượng, khách quan")} />
        <div className="grid gap-4 lg:grid-cols-3">
          {criteria.map((g) => <CriteriaCard key={tr(g.group)} g={g} />)}
        </div>
      </section>

      {/* process */}
      <section id="process" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Investment process", "Quy trình đầu tư")} title={t("First contact to term sheet: 4–8 weeks", "Từ tiếp xúc đến term sheet: 4–8 tuần")} />
        <div className="grid gap-3">
          {process.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
              <span className="mono w-20 flex-none text-[0.78rem] font-medium" style={{ color: FUND }}>{tr(s.when)}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[1rem] font-medium text-text">{tr(s.title)}</h3>
                <p className="mt-0.5 text-[0.85rem] text-text-2">{tr(s.body)}</p>
              </div>
              {s.pass && (
                <span className="mono flex-none rounded-[var(--radius-sm)] px-2.5 py-1 text-[0.74rem]" style={{ color: FUND, background: `color-mix(in srgb, ${FUND} 10%, transparent)` }}>
                  {tr(t("pass", "qua"))} {s.pass}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* founder value */}
      <section id="founders" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Value for solo founders", "Giá trị cho Solo Founder")} title={t("RAI FUND vs an independent VC", "RAI FUND so với VC độc lập")} />
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
          <table className="w-full border-collapse text-left text-[0.88rem]">
            <thead>
              <tr className="border-b border-border">
                <th className="label px-4 py-3 text-text-2">{tr(t("Item", "Hạng mục"))}</th>
                <th className="label px-4 py-3 text-text-2">{tr(t("Independent VC", "VC độc lập"))}</th>
                <th className="label px-4 py-3" style={{ color: FUND }}>RAI FUND</th>
              </tr>
            </thead>
            <tbody>
              {founderCompare.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text">{tr(r.item)}</td>
                  <td className="px-4 py-3 text-text-2">{r.vc}</td>
                  <td className="mono px-4 py-3 font-medium" style={{ color: FUND }}>{r.rai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* returns */}
      <section id="returns" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("Multi-stream returns", "Hoàn vốn đa chiều")} title={t("Four parallel return streams — not one exit", "Bốn dòng hoàn vốn song song — không chỉ một exit")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {streams.map((s) => <StreamCard key={s.code} s={s} />)}
        </div>
        <p className="mt-3 text-[0.85rem] text-text-2">
          {tr(t("Traditional VC: 100% from capital gain. RAI FUND: four parallel streams — portfolio-level volatility down 40–50%.", "VC truyền thống: 100% từ capital gain. RAI FUND: bốn dòng song song — volatility cấp portfolio giảm 40–50%."))}
        </p>
      </section>

      {/* LP terms */}
      <section id="lps" className="mt-12 scroll-mt-20">
        <SectionTitle label={t("For LPs", "Dành cho LP")} title={t("Institutional-grade terms", "Điều khoản chuẩn institutional")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2">
          {lpTerms.map((term, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 bg-surface px-5 py-4">
              <span className="text-[0.86rem] text-text-2">{tr(term.k)}</span>
              <span className="text-[0.88rem] font-medium text-text">{tr(term.v)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border p-8 text-center sm:flex-row sm:text-left" style={{ background: FUND }}>
        <div>
          <h2 className="text-[clamp(1.3rem,2.6vw,1.9rem)] text-white">{tr(fundContact.title)}</h2>
          <p className="mt-2 text-[0.95rem] text-white/80">{tr(fundContact.body)}</p>
        </div>
        <a href={`mailto:${fundContact.email}`} className="flex-none rounded-[var(--radius-md)] bg-white px-5 py-2.5 text-[0.92rem] font-medium transition-colors hover:bg-white/90" style={{ color: FUND }}>
          {tr(fundContact.cta)}
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
      <span className="accent-rule mb-3" style={{ color: FUND }} />
      <span className="label text-text-2">{tr(label)}</span>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.8vw,2rem)] font-medium text-text">{tr(title)}</h2>
    </div>
  );
}

function FundCard({ f }: { f: Fund }) {
  const { tr } = useLang();
  const specs: { k: T; v: string }[] = [
    { k: t("Stage", "Giai đoạn"), v: tr(f.stage) },
    { k: t("Ticket", "Ticket"), v: f.ticket },
    { k: t("Deals", "Số deal"), v: f.deals },
    { k: t("Hold", "Hold"), v: tr(f.hold) },
  ];
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <span className="mono text-[0.74rem] font-medium" style={{ color: FUND }}>{f.code}</span>
        <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-medium text-text">{f.name}</h3>
        <span className="ml-auto font-[family-name:var(--font-display)] text-[1.2rem] font-medium" style={{ color: FUND }}>{f.size}</span>
      </div>
      <p className="mt-2 text-[0.85rem] text-text-2">{tr(f.strategy)}</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 sm:grid-cols-4">
        {specs.map((s, i) => (
          <div key={i}>
            <dt className="mono text-[0.64rem] uppercase tracking-wide text-text-2">{tr(s.k)}</dt>
            <dd className="text-[0.84rem] text-text">{s.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CriteriaCard({ g }: { g: CriteriaGroup }) {
  const { tr } = useLang();
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <span className="accent-rule mb-3" style={{ color: FUND }} />
      <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-medium text-text">{tr(g.group)}</h3>
      <ul className="mt-3 grid gap-3 border-t border-border pt-3">
        {g.items.map((it, i) => (
          <li key={i}>
            <div className="text-[0.8rem] font-medium text-text">{tr(it.k)}</div>
            <div className="text-[0.82rem] text-text-2">{tr(it.v)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StreamCard({ s }: { s: Stream }) {
  const { tr } = useLang();
  return (
    <div className="bg-surface p-6">
      <div className="flex items-baseline justify-between">
        <span className="mono text-[0.74rem] font-medium" style={{ color: FUND }}>{s.code}</span>
        <span className="font-[family-name:var(--font-display)] text-[1.3rem] font-medium" style={{ color: FUND }}>{s.pct}</span>
      </div>
      <h3 className="mt-2 text-[1rem] font-medium text-text">{tr(s.name)}</h3>
      <p className="mt-1.5 text-[0.82rem] text-text-2">{tr(s.body)}</p>
    </div>
  );
}
