"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { getMetric, type ContentBlock, type HeroData, type MetricStripData, type PainSolutionData, type FeatureGridData, type UseCaseStepsData, type ProofData, type ComparisonData, type FaqData, type CtaBandData, metricValue } from "@/lib/enterprise";
import { useMetricOverrides } from "@/lib/enterprise-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

function Hero({ d }: { d: HeroData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16 sm:py-24`}>
        {d.eyebrow && <div className="label mb-4 text-accent">{tr(d.eyebrow)}</div>}
        <div className="accent-rule mb-6" />
        <h1 className="max-w-3xl text-[2.1rem] font-medium leading-[1.1] tracking-tight text-text sm:text-[3rem]">{tr(d.title)}</h1>
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-text-2">{tr(d.subhead)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={d.ctaHref} className={buttonClass("primary", "lg")}>{tr(d.ctaLabel)}<Icon name="arrow-up-right" size={18} /></Link>
          {d.secondaryLabel && d.secondaryHref && <Link href={d.secondaryHref} className={buttonClass("outline", "lg")}>{tr(d.secondaryLabel)}</Link>}
        </div>
      </div>
    </section>
  );
}

function MetricStrip({ d }: { d: MetricStripData }) {
  const { tr } = useLang();
  const overrides = useMetricOverrides();
  if (!d.keys.length) return null;
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} grid grid-cols-2 gap-px overflow-hidden py-0 sm:grid-cols-4`}>
        {d.keys.map((k) => {
          const m = getMetric(k);
          if (!m) return null;
          return (
            <div key={k} className="px-2 py-10">
              <div className="text-[2rem] font-medium tracking-tight text-text">{metricValue(k, overrides)}{m.unit ? <span className="ml-1 text-[1rem] text-text-2">{tr(m.unit)}</span> : null}</div>
              <div className="mt-1 text-[0.85rem] text-text-2">{tr(m.label)}</div>
              <div className="mono mt-2 text-[0.62rem] uppercase tracking-wider text-text-2/70">{m.dataSource === "system_query" ? "system query" : m.dataSource}{m.verified ? " · verified" : ""}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PainSolution({ d }: { d: PainSolutionData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16`}>
        <div className="accent-rule mb-6" />
        <div className="grid gap-px sm:grid-cols-2">
          {d.items.map((it, i) => (
            <div key={i} className="border border-border bg-bg p-6">
              <div className="label mb-2 text-err">{tr({ en: "Challenge", vi: "Thách thức" })}</div>
              <p className="text-[1rem] text-text">{tr(it.pain)}</p>
              <div className="label mb-2 mt-5 text-ok">{tr({ en: "With RAI OS", vi: "Với RAI OS" })}</div>
              <p className="text-[1rem] text-text-2">{tr(it.solution)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid({ d }: { d: FeatureGridData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <h2 className="mb-8 text-[1.5rem] font-medium tracking-tight text-text">{tr({ en: "What you get", vi: "Bạn nhận được" })}</h2>
        <div className="grid gap-px sm:grid-cols-3">
          {d.items.map((it, i) => {
            const inner = (
              <>
                <Icon name={it.icon} size={22} className="text-accent" />
                <h3 className="mt-4 text-[1.05rem] font-medium text-text">{tr(it.title)}</h3>
                <p className="mt-2 text-[0.92rem] text-text-2">{tr(it.body)}</p>
                {it.href && <div className="mono mt-4 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-accent">{tr({ en: "Open", vi: "Mở" })}<Icon name="arrow-up-right" size={13} /></div>}
              </>
            );
            return it.href
              ? <Link key={i} href={it.href} className="border border-border bg-surface p-6 transition-colors hover:border-border-strong">{inner}</Link>
              : <div key={i} className="border border-border bg-surface p-6">{inner}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

function UseCaseSteps({ d }: { d: UseCaseStepsData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16`}>
        <h2 className="mb-8 text-[1.5rem] font-medium tracking-tight text-text">{tr({ en: "How it works", vi: "Cách hoạt động" })}</h2>
        <div className="grid gap-px sm:grid-cols-3">
          {d.steps.map((s, i) => (
            <div key={i} className="border border-border bg-bg p-6">
              <div className="mono text-[0.72rem] text-text-2">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-2 text-[1.05rem] font-medium text-text">{tr(s.title)}</h3>
              <p className="mt-2 text-[0.92rem] text-text-2">{tr(s.body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof({ d }: { d: ProofData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <div className="border border-border bg-surface p-8 sm:p-12">
          <div className="accent-rule mb-6" />
          <blockquote className="max-w-3xl text-[1.4rem] font-medium leading-snug tracking-tight text-text">“{tr(d.quote)}”</blockquote>
          <div className="mt-6 text-[0.92rem] text-text">{d.author} <span className="text-text-2">· {tr(d.role)}</span></div>
          {d.logos.length > 0 && <div className="mono mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] uppercase tracking-wider text-text-2">{d.logos.map((l) => <span key={l}>{l}</span>)}</div>}
        </div>
      </div>
    </section>
  );
}

function Comparison({ d }: { d: ComparisonData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16`}>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-[0.9rem]">
            <thead><tr className="bg-bg">
              <th className="p-3" />
              {d.columns.map((c, i) => <th key={i} className="p-3 font-medium text-text">{tr(c)}</th>)}
            </tr></thead>
            <tbody>{d.rows.map((r, ri) => (
              <tr key={ri} className="border-t border-border">
                <td className="p-3 text-text">{tr(r.label)}</td>
                {r.cells.map((cell, ci) => <td key={ci} className="p-3 text-text-2">{cell}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Faq({ d }: { d: FaqData }) {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <h2 className="mb-8 text-[1.5rem] font-medium tracking-tight text-text">{tr({ en: "Frequently asked", vi: "Câu hỏi thường gặp" })}</h2>
        <div className="divide-y divide-border border-y border-border">
          {d.items.map((it, i) => (
            <details key={i} className="group p-5">
              <summary className="cursor-pointer list-none text-[1rem] font-medium text-text">{tr(it.q)}</summary>
              <p className="mt-3 text-[0.94rem] text-text-2">{tr(it.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand({ d }: { d: CtaBandData }) {
  const { tr } = useLang();
  return (
    <section className="bg-fund">
      <div className={`${WRAP} py-16 text-center`}>
        <h2 className="text-[1.8rem] font-medium tracking-tight text-white">{tr(d.title)}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[1rem] text-white/80">{tr(d.body)}</p>
        <div className="mt-7"><Link href={d.ctaHref} className={buttonClass("outline", "lg") + " !bg-white !text-fund !border-white"}>{tr(d.ctaLabel)}<Icon name="arrow-up-right" size={18} /></Link></div>
      </div>
    </section>
  );
}

export function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "hero": return <Hero d={block.data as HeroData} />;
    case "metric_strip": return <MetricStrip d={block.data as MetricStripData} />;
    case "pain_solution": return <PainSolution d={block.data as PainSolutionData} />;
    case "feature_grid": return <FeatureGrid d={block.data as FeatureGridData} />;
    case "use_case_steps": return <UseCaseSteps d={block.data as UseCaseStepsData} />;
    case "proof": return <Proof d={block.data as ProofData} />;
    case "comparison": return <Comparison d={block.data as ComparisonData} />;
    case "faq": return <Faq d={block.data as FaqData} />;
    case "cta_band": return <CtaBand d={block.data as CtaBandData} />;
    default: return null;
  }
}
