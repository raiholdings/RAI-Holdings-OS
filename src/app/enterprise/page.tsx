"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { allAxes, axisLabels, axisColor, pageRefs, plannedSegments } from "@/lib/enterprise";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

export default function EnterpriseHub() {
  const { tr } = useLang();
  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-16 sm:py-20`}>
          <div className="label mb-4 text-accent">{tr(t("RAI OS for Enterprise", "RAI OS cho doanh nghiệp"))}</div>
          <div className="accent-rule mb-6" />
          <h1 className="max-w-3xl text-[2.1rem] font-medium leading-[1.1] tracking-tight text-text sm:text-[3rem]">{tr(t("Find the right path into RAI OS", "Tìm đúng lối vào RAI OS"))}</h1>
          <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-text-2">{tr(t("Whatever your entry point — your company size, what you want to do, or your industry — there's a tailored path to running your business on the venture operating system.", "Dù bạn vào từ đâu — quy mô công ty, việc bạn muốn làm, hay ngành của bạn — đều có lối đi riêng để vận hành doanh nghiệp trên hệ điều hành khởi nghiệp."))}</p>
        </div>
      </section>

      <section className={`${WRAP} py-14`}>
        <div className="grid gap-px sm:grid-cols-3">
          {allAxes.map((axis) => {
            const refs = pageRefs(axis);
            return (
              <div key={axis} className="border border-border bg-surface p-6">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-[1px]" style={{ background: axisColor[axis] }} />
                  <h2 className="label text-text">{tr(axisLabels[axis])}</h2>
                </div>
                <ul className="mt-5 space-y-1">
                  {refs.map((r) => (
                    <li key={r.url}>
                      <Link href={r.url} className="group flex items-center justify-between gap-2 rounded-[var(--radius-md)] px-2 py-2 text-[0.95rem] text-text transition-colors hover:bg-bg">
                        <span>{tr(r.title)}</span>
                        <Icon name="arrow-up-right" size={15} className="text-text-2 transition-colors group-hover:text-accent" />
                      </Link>
                    </li>
                  ))}
                </ul>
                {plannedSegments[axis].length > 0 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="mono mb-2 text-[0.62rem] uppercase tracking-wider text-text-2/70">{tr(t("Coming soon", "Sắp có"))}</div>
                    <div className="flex flex-wrap gap-2">
                      {plannedSegments[axis].map((s, i) => <span key={i} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2">{tr(s)}</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-fund">
        <div className={`${WRAP} py-14 text-center`}>
          <h2 className="text-[1.6rem] font-medium tracking-tight text-white">{tr(t("Not sure where to start?", "Chưa biết bắt đầu từ đâu?"))}</h2>
          <p className="mx-auto mt-3 max-w-xl text-[1rem] text-white/80">{tr(t("Tell us about your business and we'll map the right RAI OS path with you.", "Cho chúng tôi biết về doanh nghiệp của bạn, chúng tôi sẽ cùng vạch lối RAI OS phù hợp."))}</p>
          <div className="mt-7"><Link href="/enterprise/contribute" className={buttonClass("outline", "lg") + " !bg-white !text-fund !border-white"}>{tr(t("Contact enterprise sales", "Liên hệ tư vấn doanh nghiệp"))}<Icon name="arrow-up-right" size={18} /></Link></div>
        </div>
      </section>
    </main>
  );
}
