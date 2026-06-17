"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { planPrice, type AddOn, type ComparisonGroup, type ComparisonValue, type Plan, type PlanKind, type PricingPage } from "@/lib/pricing";
import { effectivePricing, hydrateStore, useDraft } from "@/lib/pricing-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

const segmentCaption: Record<PlanKind, { en: string; vi: string }> = {
  subscription: t("Subscription plans for teams of every size.", "Các gói thuê bao cho đội ngũ mọi quy mô."),
  program: t("AI-native venture builder programs, by industry.", "Các chương trình AI-native venture builder, theo ngành."),
  platform: t("Per-platform pricing across the RAI ecosystem — from the business platform to SaaS/PaaS.", "Giá theo từng nền tảng trong hệ sinh thái RAI — từ nền tảng kinh doanh đến SaaS/PaaS."),
};

export function PricingView({ seed }: { seed: PricingPage }) {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  useDraft(); // re-render on admin edits
  const page = effectivePricing(seed);
  const [segment, setSegment] = useState<PlanKind>("subscription");
  const published = page.plans.filter((p) => p.status === "published");
  const cards = published.filter((p) => p.kind === segment);

  return (
    <main>
      {page.trialBanner.enabled && (
        <div className="border-b border-border bg-fund text-white">
          <div className={`${WRAP} flex flex-wrap items-center justify-center gap-2 py-2.5 text-center text-[0.88rem]`}>
            <span>{tr(page.trialBanner.text)}</span>
            <Link href={page.trialBanner.linkUrl} className="inline-flex items-center gap-1 font-medium underline underline-offset-2">{tr(page.trialBanner.linkText)}<Icon name="arrow-up-right" size={14} /></Link>
          </div>
        </div>
      )}

      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-14 text-center`}>
          <div className="accent-rule mx-auto mb-6" />
          <h1 className="mx-auto max-w-3xl text-[2.1rem] font-medium leading-[1.1] tracking-tight text-text sm:text-[2.7rem]">{tr(page.heroTitle)}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[1.05rem] text-text-2">{tr(page.heroSubtitle)}</p>
          <SegmentToggle segment={segment} setSegment={setSegment} />
          <p className="mx-auto mt-4 max-w-xl text-[0.86rem] text-text-2">{tr(segmentCaption[segment])}</p>
        </div>
      </section>

      <section className={`${WRAP} py-12`}>
        <div className={cn("grid gap-px", cards.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : cards.length === 2 ? "sm:grid-cols-2" : "max-w-md")}>
          {cards.map((p) => <PlanCard key={p.key} plan={p} addOns={page.addOns} />)}
        </div>
        {cards.length === 0 && <p className="text-[0.92rem] text-text-2">{tr(t("No plans in this category yet.", "Chưa có gói trong nhóm này."))}</p>}
      </section>

      {page.addOns.some((a) => a.scope === "additional") && (
        <section className="border-y border-border bg-surface">
          <div className={`${WRAP} py-12`}>
            <h2 className="mb-6 text-[1.4rem] font-medium tracking-tight text-text">{tr(t("Additional add-ons", "Tiện ích bổ sung"))}</h2>
            <div className="grid gap-px sm:grid-cols-3">
              {page.addOns.filter((a) => a.scope === "additional").map((a) => (
                <Link key={a.id} href={a.url} className="border border-border bg-bg p-5 transition-colors hover:border-border-strong">
                  <div className="font-medium text-text">{tr(a.name)}</div>
                  <p className="mt-1 text-[0.88rem] text-text-2">{tr(a.description)}</p>
                  <div className="mono mt-3 text-[0.72rem] uppercase tracking-wider text-accent">{tr(a.priceLabel)}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${WRAP} py-12`}>
        <div className="border border-border bg-surface p-8 sm:p-10">
          <blockquote className="max-w-3xl text-[1.3rem] font-medium leading-snug tracking-tight text-text">“{tr(page.proof.quote)}”</blockquote>
          <div className="mt-5 text-[0.92rem] text-text">{page.proof.author} <span className="text-text-2">· {tr(page.proof.role)}</span></div>
          {page.proof.logos.length > 0 && <div className="mono mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] uppercase tracking-wider text-text-2">{page.proof.logos.map((l) => <span key={l}>{l}</span>)}</div>}
        </div>
      </section>

      <CompareTable groups={page.comparison} plans={published.filter((p) => p.kind === "subscription")} />

      {page.faq.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className={`${WRAP} py-12`}>
            <h2 className="mb-6 text-[1.4rem] font-medium tracking-tight text-text">{tr(t("Pricing FAQ", "Câu hỏi về giá"))}</h2>
            <div className="divide-y divide-border border-y border-border">
              {page.faq.map((it, i) => (
                <details key={i} className="p-5"><summary className="cursor-pointer list-none text-[1rem] font-medium text-text">{tr(it.q)}</summary><p className="mt-3 text-[0.94rem] text-text-2">{tr(it.a)}</p></details>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/** Switches the plan cards between standard business plans and themed programs. */
function SegmentToggle({ segment, setSegment }: { segment: PlanKind; setSegment: (s: PlanKind) => void }) {
  const { tr } = useLang();
  const opts: { kind: PlanKind; label: { en: string; vi: string } }[] = [
    { kind: "subscription", label: t("Business", "Doanh nghiệp") },
    { kind: "program", label: t("Programs", "Chương trình") },
    { kind: "platform", label: t("Platform", "Nền tảng") },
  ];
  return (
    <div className="mt-8 inline-flex overflow-hidden rounded-[var(--radius-md)] border border-border-strong">
      {opts.map((o) => (
        <button key={o.kind} onClick={() => setSegment(o.kind)} className={cn("px-5 py-2 text-[0.85rem] transition-colors", segment === o.kind ? "bg-accent text-white" : "bg-surface text-text-2 hover:text-text")}>
          {tr(o.label)}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, addOns }: { plan: Plan; addOns: AddOn[] }) {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const price = planPrice(plan, "monthly");
  const featured = plan.featuredAddOnIds.map((id) => addOns.find((a) => a.id === id)).filter(Boolean) as AddOn[];
  const items = open ? plan.featureItems : plan.featureItems.slice(0, 4);

  return (
    <div className={cn("flex flex-col border bg-surface p-5", plan.recommended ? "border-accent" : "border-border")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[1.1rem] font-medium text-text">{tr(plan.name)}</h3>
        {plan.recommended && <span className="mono rounded-[var(--radius-md)] bg-accent px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">{tr(t("Recommended", "Đề xuất"))}</span>}
        {plan.kind === "program" && <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-warn">{tr(t("Program", "Chương trình"))}</span>}
      </div>
      <p className="mt-1 min-h-[2.4rem] text-[0.86rem] text-text-2">{tr(plan.tagline)}</p>

      <div className="mt-3">
        <div className="text-[1.8rem] font-medium tracking-tight text-text">{price.amount}{price.unit && plan.priceModel !== "contact" ? <span className="ml-1 text-[0.8rem] text-text-2">{tr(price.unit)}</span> : null}</div>
        {price.note && <div className="mt-0.5 text-[0.76rem] text-text-2">{tr(price.note)}</div>}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {plan.ctas.map((c, i) => <Link key={i} href={c.url} className={buttonClass(c.style === "primary" ? "primary" : "outline", "sm") + " w-full"}>{tr(c.label)}</Link>)}
      </div>

      {plan.highlightGroups.map((g, gi) => (
        <div key={gi} className="mt-5">
          <div className="label mb-2 text-accent">{tr(g.title)}</div>
          <ul className="space-y-2">
            {g.items.map((it, ii) => (
              <li key={ii} className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-ok" /><div><div className="text-[0.86rem] text-text">{tr(it.title)}</div><div className="text-[0.78rem] text-text-2">{tr(it.description)}</div></div></li>
            ))}
          </ul>
        </div>
      ))}

      {plan.featureItems.length > 0 && (
        <div className="mt-5">
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="flex gap-2"><Icon name="check" size={15} className="mt-0.5 shrink-0 text-ok" /><div><div className="text-[0.86rem] text-text">{tr(it.title)}{it.valueLabel ? <span className="ml-1 text-text-2">· {tr(it.valueLabel)}</span> : null}</div><div className="text-[0.78rem] text-text-2">{tr(it.description)}</div></div></li>
            ))}
          </ul>
          {plan.featureItems.length > 4 && <button onClick={() => setOpen((o) => !o)} className="mono mt-3 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-accent">{open ? tr(t("Hide features", "Ẩn tính năng")) : tr(t("Show features", "Hiển thị tính năng"))}<Icon name={open ? "x" : "arrow-up-right"} size={13} /></button>}
        </div>
      )}

      {featured.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <div className="mono mb-2 text-[0.62rem] uppercase tracking-wider text-text-2/70">{tr(t("Featured add-ons", "Tiện ích nổi bật"))}</div>
          {featured.map((a) => <div key={a.id} className="text-[0.8rem] text-text-2">+ {tr(a.name)} <span className="text-text-2/70">· {tr(a.priceLabel)}</span></div>)}
        </div>
      )}
    </div>
  );
}

function ValueCell({ v }: { v?: ComparisonValue }) {
  const { tr } = useLang();
  if (!v || v.kind === "no") return <Icon name="x" size={15} className="text-text-2/50" />;
  if (v.kind === "yes") return <Icon name="check" size={16} className="text-ok" />;
  return <span className="text-[0.82rem] text-text">{v.text ? tr(v.text) : ""}</span>;
}

function CompareTable({ groups, plans }: { groups: ComparisonGroup[]; plans: Plan[] }) {
  const { tr } = useLang();
  const [focus, setFocus] = useState(plans.find((p) => p.recommended)?.key ?? plans[0]?.key);
  const sorted = [...groups].sort((a, b) => a.order - b.order);
  return (
    <section className="border-t border-border bg-bg">
      <div className={`${WRAP} py-12`}>
        <h2 className="mb-6 text-[1.4rem] font-medium tracking-tight text-text">{tr(t("Compare features", "So sánh tính năng"))}</h2>
        {/* mobile plan picker */}
        <div className="mb-4 flex flex-wrap gap-1 sm:hidden">
          {plans.map((p) => <button key={p.key} onClick={() => setFocus(p.key)} className={cn("rounded-[var(--radius-md)] border px-2.5 py-1 text-[0.78rem]", focus === p.key ? "border-accent bg-surface text-text" : "border-border text-text-2")}>{tr(p.name)}</button>)}
        </div>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-[0.88rem]">
            <thead>
              <tr className="bg-surface">
                <th className="p-3 font-medium text-text">{tr(t("Feature", "Tính năng"))}</th>
                {plans.map((p) => <th key={p.key} className={cn("p-3 font-medium text-text", focus !== p.key && "hidden sm:table-cell")}>{tr(p.name)}</th>)}
              </tr>
            </thead>
            <tbody>
              {sorted.map((g) => (
                <Fragment key={g.id}>
                  <tr className="border-t border-border bg-bg"><td colSpan={plans.length + 1} className="label p-3 text-accent">{tr(g.title)}</td></tr>
                  {g.rows.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-3 align-top"><div className="text-text">{tr(r.featureName)}</div><div className="text-[0.78rem] text-text-2">{tr(r.featureDescription)}</div></td>
                      {plans.map((p) => <td key={p.key} className={cn("p-3 align-top", focus !== p.key && "hidden sm:table-cell")}><ValueCell v={r.values[p.key]} /></td>)}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
