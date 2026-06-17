"use client";

import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useHomeMetrics } from "@/components/home/LiveProvider";
import { listEntries, pillarColor, pillarLabels } from "@/lib/portfolio";
import { getPlan } from "@/lib/pricing";
import { allAxes, axisLabels, axisColor, pageRefs } from "@/lib/enterprise";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

/* ------------------------------ Pillars --------------------------------- */
export function Pillars() {
  const { tr } = useLang();
  const items = [
    { icon: "school", title: t("Education", "Giáo dục"), body: t("Train founders with AI-era entrepreneurial thinking.", "Đào tạo nhà sáng lập tư duy khởi nghiệp thời đại AI.") },
    { icon: "cpu", title: t("Research", "Nghiên cứu"), body: t("Turn knowledge into core AI-native technology.", "Biến tri thức thành công nghệ AI-native lõi.") },
    { icon: "bolt", title: t("Innovation", "Đổi mới"), body: t("Incubate and accelerate ideas into real companies.", "Ươm tạo và tăng tốc ý tưởng thành doanh nghiệp thật.") },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16`}>
        <div className="accent-rule mb-4" />
        <h2 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Three pillars that build", "Ba trụ cột kiến tạo"))}</h2>
        <p className="mt-2 max-w-xl text-[0.98rem] text-text-2">{tr(t("Education, Research, and Innovation — the MIT-inspired engine behind RAI.", "Education, Research và Innovation — cỗ máy lấy cảm hứng MIT đằng sau RAI."))}</p>
        <div className="mt-8 grid gap-px sm:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="border border-border bg-bg p-6">
              <span className="grid size-10 place-items-center rounded-[var(--radius-md)] border border-border" style={{ color: "#C9A227" }}><Icon name={it.icon} size={22} /></span>
              <h3 className="mt-4 text-[1.1rem] font-medium text-text">{tr(it.title)}</h3>
              <p className="mt-2 text-[0.92rem] text-text-2">{tr(it.body)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6"><Link href="/about/ecosystem" className={buttonClass("outline", "sm")}>{tr(t("About the ecosystem", "Về hệ sinh thái"))}<Icon name="arrow-up-right" size={14} /></Link></div>
      </div>
    </section>
  );
}

/* ------------------------------ Feature grid (live) --------------------- */
const FEATURES: { icon: string; name: { en: string; vi: string }; desc: { en: string; vi: string }; href: string; statKey?: string }[] = [
  { icon: "robot", name: t("RAI Apps", "RAI Apps"), desc: t("AI apps in-chat (MCP, SEP-1865).", "App AI trong chat (MCP, SEP-1865)."), href: "/apps", statKey: "apps" },
  { icon: "server", name: t("MCP Registry", "MCP Registry"), desc: t("Connect models to real systems.", "Kết nối model với hệ thống thật."), href: "/mcp", statKey: "mcp" },
  { icon: "cart", name: t("Marketplace", "Marketplace"), desc: t("Buy and sell apps & services.", "Mua bán app & dịch vụ."), href: "/marketplace", statKey: "listings" },
  { icon: "bolt", name: t("Code", "Code"), desc: t("Build and instantly deploy.", "Xây và deploy tức thì."), href: "/code", statKey: "deploys" },
  { icon: "stack", name: t("Platform", "Nền tảng"), desc: t("Global software & platform catalog.", "Catalog nền tảng & phần mềm toàn cầu."), href: "/platform", statKey: "platforms" },
  { icon: "building", name: t("Portfolio", "Danh mục"), desc: t("Companies in the ecosystem.", "Công ty trong hệ sinh thái."), href: "/portfolio", statKey: "companies" },
  { icon: "coins", name: t("Pricing", "Bảng giá"), desc: t("Plans, programs, and platforms.", "Gói, chương trình và nền tảng."), href: "/pricing" },
  { icon: "target", name: t("Enterprise", "Doanh nghiệp"), desc: t("Solutions by size, use case, industry.", "Giải pháp theo quy mô, tình huống, ngành."), href: "/enterprise" },
  { icon: "home", name: t("Company", "Giới thiệu"), desc: t("Who we are and how we build.", "Chúng tôi là ai và kiến tạo ra sao."), href: "/about" },
];
export function FeatureGrid() {
  const { tr } = useLang();
  const { metrics } = useHomeMetrics();
  const stat = (k?: string) => (k ? metrics.stats.find((s) => s.key === k) : undefined);
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <div className="accent-rule mb-4" />
        <h2 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Everything in one operating system", "Tất cả trong một hệ điều hành"))}</h2>
        <div className="mt-8 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const s = stat(f.statKey);
            return (
              <Link key={i} href={f.href} className="group border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                <div className="flex items-center justify-between">
                  <Icon name={f.icon} size={22} className="text-accent" />
                  {s && <span className="text-[1.15rem] font-medium tracking-tight text-text">{s.value.toLocaleString("en-US")}</span>}
                </div>
                <h3 className="mt-3 text-[1.02rem] font-medium text-text">{tr(f.name)}</h3>
                <p className="mt-1 text-[0.88rem] text-text-2">{tr(f.desc)}</p>
                {s && <div className="mono mt-2 text-[0.6rem] uppercase tracking-wider text-text-2/70">{tr(s.label)}</div>}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Featured portfolio ---------------------- */
export function FeaturedPortfolio() {
  const { tr } = useLang();
  const entries = listEntries().filter((e) => e.featured).slice(0, 4);
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16`}>
        <div className="mb-8 flex items-end justify-between gap-3">
          <div><div className="accent-rule mb-4" /><h2 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("In the RAI ecosystem", "Trong hệ sinh thái RAI"))}</h2></div>
          <Link href="/portfolio" className="mono text-[0.72rem] uppercase tracking-wider text-accent">{tr(t("All entries", "Tất cả"))} →</Link>
        </div>
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((e) => (
            <Link key={e.id} href={`/portfolio/${e.slug}`} className="border border-border bg-bg p-5 transition-colors hover:border-border-strong">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-[var(--radius-md)] text-[0.8rem] font-medium text-white" style={{ background: e.accent }}>{e.monogram}</span>
                <span className="mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.56rem] uppercase tracking-wider text-white" style={{ background: pillarColor[e.pillar] }}>{tr(pillarLabels[e.pillar])}</span>
              </div>
              <h3 className="mt-3 text-[1rem] font-medium text-text">{e.name}</h3>
              <p className="mt-1 line-clamp-2 text-[0.84rem] text-text-2">{tr(e.tagline)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Featured plan --------------------------- */
export function FeaturedPlan() {
  const { tr } = useLang();
  const plan = getPlan("proptech");
  if (!plan) return null;
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <div className="border border-border bg-surface p-8 sm:p-10">
          <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-warn">{tr(t("Featured program", "Chương trình nổi bật"))}</span>
          <h2 className="mt-4 text-[1.7rem] font-medium tracking-tight text-text">{tr(plan.name)}</h2>
          <p className="mt-2 max-w-2xl text-[1rem] text-text-2">{tr(plan.tagline)}</p>
          <div className="mt-5 grid gap-px sm:grid-cols-3">
            {plan.highlightGroups.map((g, i) => (
              <div key={i} className="border border-border bg-bg p-4">
                <div className="label mb-2 text-accent">{tr(g.title)}</div>
                <ul className="space-y-1">{g.items.slice(0, 3).map((it, j) => <li key={j} className="text-[0.84rem] text-text-2">{tr(it.title)}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pricing" className={buttonClass("primary")}>{tr(t("See programs", "Xem chương trình"))}<Icon name="arrow-up-right" size={16} /></Link>
            <Link href={`/pricing/${plan.key}`} className={buttonClass("outline")}>{tr(t("Program details", "Chi tiết chương trình"))}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Enterprise axes ------------------------- */
export function EnterpriseAxes() {
  const { tr } = useLang();
  return (
    <section className="border-b border-border bg-surface">
      <div className={`${WRAP} py-16`}>
        <div className="accent-rule mb-4" />
        <h2 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("For enterprises, by segment", "Cho doanh nghiệp, theo phân khúc"))}</h2>
        <div className="mt-8 grid gap-px sm:grid-cols-3">
          {allAxes.map((axis) => (
            <div key={axis} className="border border-border bg-bg p-6">
              <div className="flex items-center gap-2"><span className="size-2.5 rounded-[1px]" style={{ background: axisColor[axis] }} /><h3 className="label text-text">{tr(axisLabels[axis])}</h3></div>
              <ul className="mt-4 space-y-1">
                {pageRefs(axis).slice(0, 3).map((r) => <li key={r.url}><Link href={r.url} className="text-[0.9rem] text-text-2 hover:text-text">{tr(r.title)}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6"><Link href="/enterprise" className={buttonClass("outline", "sm")}>{tr(t("Explore enterprise", "Khám phá doanh nghiệp"))}<Icon name="arrow-up-right" size={14} /></Link></div>
      </div>
    </section>
  );
}

/* ------------------------------ Impact ---------------------------------- */
export function Impact() {
  const { tr } = useLang();
  const { metrics } = useHomeMetrics();
  const actual = metrics.stats.filter((s) => ["apps", "deploys", "companies", "platforms"].includes(s.key));
  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <div className="accent-rule mb-4" />
        <h2 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Impact — aspiration vs. reality", "Tác động — khát vọng vs thực tế"))}</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border border-border bg-surface p-6">
            <div className="label mb-3" style={{ color: "#C9A227" }}>{tr(t("Aspiration · MIT model", "Khát vọng · hình mẫu MIT"))}</div>
            <ul className="space-y-3">
              {metrics.aspiration.map((a, i) => <li key={i}><div className="text-[1.05rem] font-medium text-text">{tr(a.label)}</div><div className="mono text-[0.62rem] uppercase tracking-wider text-text-2/70">{tr(a.note)}</div></li>)}
            </ul>
            <p className="mt-4 text-[0.8rem] italic text-text-2">{tr(t("Inspired by the MIT model; targets, not current results.", "Lấy cảm hứng từ mô hình MIT; là mục tiêu, không phải kết quả hiện tại."))}</p>
          </div>
          <div className="border border-border bg-surface p-6">
            <div className="label mb-3 text-ok">{tr(t("Actual · live from systems", "Thực tế · sống từ hệ thống"))}</div>
            <div className="grid grid-cols-2 gap-px">
              {actual.map((s) => <div key={s.key} className="border border-border bg-bg p-4"><div className="text-[1.6rem] font-medium tracking-tight text-text">{s.value.toLocaleString("en-US")}</div><div className="mt-0.5 text-[0.82rem] text-text-2">{tr(s.label)}</div></div>)}
            </div>
            <p className="mt-4 text-[0.8rem] italic text-text-2">{tr(t("Pulled live from the platforms — sourced, never fabricated.", "Kéo sống từ các nền tảng — có nguồn, không bịa."))}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA ------------------------------- */
export function FinalCta() {
  const { tr } = useLang();
  return (
    <section className="bg-fund" id="cta-final">
      <div className={`${WRAP} py-20 text-center`}>
        <h2 className="text-[2rem] font-medium tracking-tight text-white">{tr(t("Build your company on RAI OS", "Xây doanh nghiệp của bạn trên RAI OS"))}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[1.05rem] text-white/80">{tr(t("From idea to a live, AI-native venture — with the platforms, programs, and capital of the RAI ecosystem.", "Từ ý tưởng đến venture AI-native chạy thật — cùng nền tảng, chương trình và vốn của hệ sinh thái RAI."))}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/apps" className={buttonClass("outline", "lg") + " !bg-white !text-fund !border-white"}>{tr(t("Start building", "Bắt đầu xây dựng"))}<Icon name="arrow-up-right" size={18} /></Link>
          <Link href="/about/contact" className={buttonClass("outline", "lg") + " !text-white !border-white/40 hover:!bg-white/10"}>{tr(t("Talk to us", "Liên hệ"))}</Link>
        </div>
      </div>
    </section>
  );
}
