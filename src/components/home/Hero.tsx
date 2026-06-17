"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useHomeMetrics } from "@/components/home/LiveProvider";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

export function Hero() {
  const { tr } = useLang();
  const { metrics } = useHomeMetrics();
  const strip = metrics.stats.filter((s) => ["apps", "platforms", "companies", "mcp"].includes(s.key));
  return (
    <section className="border-b border-border bg-surface" id="top">
      <div className={`${WRAP} py-16 sm:py-24`}>
        <div className="label mb-4 text-accent">{tr(t("AI-native venture builder", "Nhà kiến tạo doanh nghiệp AI-native"))}</div>
        <div className="accent-rule mb-6" />
        <h1 className="max-w-4xl text-[2.3rem] font-medium leading-[1.08] tracking-tight text-text sm:text-[3.4rem]">{tr(t("RAI Holdings — building companies for the AI era", "RAI Holdings — Nhà kiến tạo doanh nghiệp thời đại AI"))}</h1>
        <p className="mt-5 max-w-2xl text-[1.1rem] leading-relaxed text-text-2">{tr(t("The venture operating system for the AI-native economy — one ecosystem of platforms, programs, and companies, live in real time.", "Hệ điều hành khởi nghiệp cho nền kinh tế AI-native — một hệ sinh thái nền tảng, chương trình và công ty, cập nhật thời gian thực."))}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/about/ecosystem" className={buttonClass("primary", "lg")}>{tr(t("Explore the ecosystem", "Khám phá hệ sinh thái"))}<Icon name="arrow-up-right" size={18} /></Link>
          <Link href="/apps" className={buttonClass("outline", "lg")}>{tr(t("Try the platform", "Dùng thử"))}</Link>
        </div>
        {/* live counter strip */}
        <div className="mt-12 grid grid-cols-2 gap-px border border-border sm:grid-cols-4">
          {strip.map((s) => (
            <div key={s.key} className="bg-bg px-4 py-5">
              <div className="text-[1.7rem] font-medium tracking-tight text-text">{s.value.toLocaleString("en-US")}{s.stale && <span className="ml-1 text-warn" title="updating">·</span>}</div>
              <div className="mt-0.5 text-[0.82rem] text-text-2">{tr(s.label)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
