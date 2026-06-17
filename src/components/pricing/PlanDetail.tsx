"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { planPrice, type Plan } from "@/lib/pricing";

const WRAP = "mx-auto max-w-[900px] px-5 sm:px-8";

export function PlanDetail({ plan }: { plan: Plan }) {
  const { tr } = useLang();
  const price = planPrice(plan, "monthly");
  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-14`}>
          <Link href="/pricing" className="mono mb-6 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-text-2 hover:text-text"><Icon name="arrow-up-right" size={13} className="rotate-180" />{tr(t("All plans", "Tất cả gói"))}</Link>
          <div className="flex flex-wrap items-center gap-2">
            {plan.kind === "program" && <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-warn">{tr(t("Program", "Chương trình"))}</span>}
            {plan.recommended && <span className="mono rounded-[var(--radius-md)] bg-accent px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">{tr(t("Recommended", "Đề xuất"))}</span>}
          </div>
          <div className="accent-rule mb-5 mt-4" />
          <h1 className="text-[2rem] font-medium tracking-tight text-text sm:text-[2.5rem]">{tr(plan.name)}</h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] text-text-2">{tr(plan.tagline)}</p>
          <div className="mt-5 text-[1.6rem] font-medium tracking-tight text-text">{price.amount}{price.unit && plan.priceModel !== "contact" ? <span className="ml-1 text-[0.8rem] text-text-2">{tr(price.unit)}</span> : null}</div>
          {price.note && <div className="mt-1 text-[0.84rem] text-text-2">{tr(price.note)}</div>}
          <div className="mt-6 flex flex-wrap gap-3">
            {plan.ctas.map((c, i) => <Link key={i} href={c.url} className={buttonClass(c.style === "primary" ? "primary" : "outline", "lg")}>{tr(c.label)}</Link>)}
          </div>
        </div>
      </section>

      {plan.highlightGroups.map((g, gi) => (
        <section key={gi} className="border-b border-border bg-bg">
          <div className={`${WRAP} py-12`}>
            <h2 className="mb-6 text-[1.4rem] font-medium tracking-tight text-text">{tr(g.title)}</h2>
            <div className="grid gap-px sm:grid-cols-2">
              {g.items.map((it, ii) => (
                <div key={ii} className="border border-border bg-surface p-5"><div className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-ok" /><div><div className="font-medium text-text">{tr(it.title)}</div><p className="mt-1 text-[0.88rem] text-text-2">{tr(it.description)}</p></div></div></div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {plan.featureItems.length > 0 && (
        <section className="border-b border-border bg-bg">
          <div className={`${WRAP} py-12`}>
            <h2 className="mb-6 text-[1.4rem] font-medium tracking-tight text-text">{tr(t("What's included", "Bao gồm"))}</h2>
            <ul className="space-y-3">
              {plan.featureItems.map((it) => (
                <li key={it.id} className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-ok" /><div><div className="text-[0.95rem] text-text">{tr(it.title)}{it.valueLabel ? <span className="ml-1 text-text-2">· {tr(it.valueLabel)}</span> : null}</div><div className="text-[0.84rem] text-text-2">{tr(it.description)}</div></div></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-fund">
        <div className={`${WRAP} py-12 text-center`}>
          <h2 className="text-[1.6rem] font-medium tracking-tight text-white">{tr(t("Ready to start?", "Sẵn sàng bắt đầu?"))}</h2>
          <p className="mx-auto mt-3 max-w-xl text-[1rem] text-white/80">{tr(t("Talk to an advisor to tailor this plan to your business.", "Trao đổi với chuyên gia để may đo gói này cho doanh nghiệp của bạn."))}</p>
          <div className="mt-6"><Link href="/enterprise/contribute" className={buttonClass("outline", "lg") + " !bg-white !text-fund !border-white"}>{tr(t("Contact sales", "Liên hệ tư vấn"))}<Icon name="arrow-up-right" size={18} /></Link></div>
        </div>
      </section>
    </main>
  );
}
