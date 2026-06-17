"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { allPlatforms, getCategory, pricingLabels, deploymentLabels, companySizeLabels, sourceTypeLabels, type CompanySize, type Platform } from "@/lib/platform";
import { addReview, effectiveRating, hydrateStore, useApprovedPlatforms, useReviews, type Review } from "@/lib/platform-store";

const WRAP = "mx-auto max-w-[1000px] px-5 sm:px-8";
type Tab = "overview" | "usecases" | "pricing" | "reviews" | "alternatives" | "sources";

export function PlatformDetail({ slug, seed }: { slug: string; seed: Platform | null }) {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  const approved = useApprovedPlatforms();
  const reviews = useReviews();
  const [tab, setTab] = useState<Tab>("overview");

  const p = seed ?? approved.find((x) => x.slug === slug) ?? null;
  const rating = useMemo(() => (p ? effectiveRating(p, reviews) : { ratingAvg: 0, reviewCount: 0 }), [p, reviews]);
  const myReviews = useMemo(() => reviews.filter((r) => r.platformSlug === slug && r.status === "published"), [reviews, slug]);
  const alternatives = useMemo(() => {
    if (!p) return [];
    return [...allPlatforms(), ...approved].filter((x) => x.slug !== p.slug && x.categorySlugs.some((c) => p.categorySlugs.includes(c))).slice(0, 4);
  }, [p, approved]);

  if (!p) return <main className={`${WRAP} py-20 text-center`}><p className="text-text-2">{tr(t("Platform not found.", "Không tìm thấy nền tảng."))}</p><Link href="/platform" className="mono mt-4 inline-block text-[0.8rem] uppercase tracking-wider text-accent">{tr(t("Back to catalog", "Về catalog"))}</Link></main>;

  const tabs: { id: Tab; label: ReturnType<typeof t> }[] = [
    { id: "overview", label: t("Overview", "Tổng quan") },
    { id: "usecases", label: t("Use cases", "Ứng dụng") },
    { id: "pricing", label: t("Pricing", "Gói giá") },
    { id: "reviews", label: t("Reviews", "Đánh giá") },
    { id: "alternatives", label: t("Alternatives", "Thay thế") },
    { id: "sources", label: t("Sources", "Nguồn") },
  ];

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-10`}>
          <Link href="/platform" className="mono mb-6 inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-wider text-text-2 hover:text-text"><Icon name="arrow-up-right" size={13} className="rotate-180" />{tr(t("Catalog", "Danh mục"))}</Link>
          <div className="flex flex-wrap items-start gap-4">
            <span className="grid size-14 place-items-center rounded-[var(--radius-md)] text-[1.1rem] font-medium text-white" style={{ background: p.accent }}>{p.monogram}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.8rem] font-medium tracking-tight text-text">{p.name}</h1>
                {p.isRaiPlatform && <span className="mono rounded-[var(--radius-md)] bg-accent px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">RAI</span>}
                {p.openSource && <span className="mono rounded-[var(--radius-md)] bg-ok/15 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-ok">OSS{p.licenseSpdx ? ` · ${p.licenseSpdx}` : ""}</span>}
              </div>
              <div className="mono mt-1 text-[0.78rem] text-text-2">{p.vendorName}</div>
              <p className="mt-2 max-w-2xl text-[1rem] text-text-2">{tr(p.shortDescription)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {rating.reviewCount > 0 ? <span className="inline-flex items-center gap-1 text-[0.9rem] text-text"><span style={{ color: "#C9A227" }}>★</span>{rating.ratingAvg.toFixed(1)} <span className="text-text-2">({rating.reviewCount})</span></span> : <span className="mono text-[0.74rem] text-text-2">{tr(t("No reviews yet", "Chưa có đánh giá"))}</span>}
                <a href={p.websiteUrl} target="_blank" rel="noreferrer" className={buttonClass("outline", "sm")}>{tr(t("Website", "Trang web"))}<Icon name="arrow-up-right" size={13} /></a>
              </div>
              {p.raiRefs.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{p.raiRefs.map((r, i) => <Link key={i} href={r.href} className="mono inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-accent/40 bg-accent/5 px-2.5 py-1 text-[0.72rem] text-accent">{tr(r.label)}<Icon name="arrow-up-right" size={12} /></Link>)}</div>}
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-16 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className={`${WRAP} flex gap-0.5 overflow-x-auto`}>
          {tabs.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("whitespace-nowrap border-b-2 px-3 py-3 text-[0.85rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>{tr(tb.label)}</button>)}
        </div>
      </nav>

      <div className={`${WRAP} py-10`}>
        {tab === "overview" && (
          <div className="space-y-6">
            <p className="max-w-3xl text-[1.02rem] leading-relaxed text-text-2">{tr(p.longDescription)}</p>
            <div className="grid gap-px sm:grid-cols-2">
              <Facts title={tr(t("Categories", "Danh mục"))} items={p.categorySlugs.map((c) => getCategory(c)?.name).filter(Boolean).map((n) => tr(n!))} />
              <Facts title={tr(t("Deployment", "Triển khai"))} items={p.deployment.map((d) => tr(deploymentLabels[d]))} />
              <Facts title={tr(t("Company size", "Quy mô"))} items={p.companySizeFit.map((s) => tr(companySizeLabels[s]))} />
              <Facts title={tr(t("Platform types", "Loại nền tảng"))} items={p.platformTypes} />
            </div>
            {p.features.length > 0 && <div><div className="label mb-2 text-text-2">{tr(t("Key features", "Tính năng chính"))}</div><div className="flex flex-wrap gap-2">{p.features.map((f) => <span key={f} className="rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-1 text-[0.84rem] text-text">{f}</span>)}</div></div>}
            {p.integrations.length > 0 && <div><div className="label mb-2 text-text-2">{tr(t("Integrations", "Tích hợp"))}</div><div className="flex flex-wrap gap-2">{p.integrations.map((f) => <span key={f} className="rounded-[var(--radius-md)] border border-border px-2.5 py-1 text-[0.84rem] text-text-2">{f}</span>)}</div></div>}
          </div>
        )}
        {tab === "usecases" && (p.useCases.length > 0 ? <div className="grid gap-px sm:grid-cols-2">{p.useCases.map((u, i) => <div key={i} className="border border-border bg-surface p-5"><h3 className="font-medium text-text">{tr(u.title)}</h3><p className="mt-1 text-[0.88rem] text-text-2">{tr(u.description)}</p></div>)}</div> : <p className="text-[0.92rem] text-text-2">{tr(t("Use cases will be added.", "Ứng dụng sẽ được bổ sung."))}</p>)}
        {tab === "pricing" && (
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2"><span className="label text-text-2">{tr(t("Pricing model", "Mô hình giá"))}</span><span className="font-medium text-text">{tr(pricingLabels[p.pricingModel])}</span></div>
            {p.pricingTiers.length > 0 ? <div className="grid gap-px sm:grid-cols-3">{p.pricingTiers.map((tier, i) => <div key={i} className="border border-border bg-surface p-5"><div className="font-medium text-text">{tier.name}</div><div className="mt-1 text-[0.84rem] text-text-2">{tr(tier.highlights)}</div></div>)}</div> : <p className="text-[0.9rem] text-text-2">{tr(t("See the vendor's site for current prices.", "Xem trang nhà cung cấp để biết giá hiện tại."))} {p.isRaiPlatform && p.raiRefs[1] && <Link href={p.raiRefs[1].href} className="text-accent">→ {tr(t("RAI pricing", "Bảng giá RAI"))}</Link>}</p>}
          </div>
        )}
        {tab === "reviews" && <ReviewsTab slug={p.slug} reviews={myReviews} />}
        {tab === "alternatives" && (alternatives.length > 0 ? <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">{alternatives.map((a) => <Link key={a.id} href={`/platform/${a.slug}`} className="border border-border bg-surface p-4 transition-colors hover:border-border-strong"><span className="grid size-9 place-items-center rounded-[var(--radius-md)] text-[0.72rem] font-medium text-white" style={{ background: a.accent }}>{a.monogram}</span><div className="mt-2 font-medium text-text">{a.name}</div><p className="mt-1 line-clamp-2 text-[0.82rem] text-text-2">{tr(a.shortDescription)}</p></Link>)}</div> : <p className="text-[0.92rem] text-text-2">{tr(t("No alternatives found.", "Không tìm thấy nền tảng thay thế."))}</p>)}
        {tab === "sources" && (
          <div className="space-y-3">
            <p className="text-[0.88rem] text-text-2">{tr(t("Provenance — where each piece of data came from and when.", "Nguồn gốc — mỗi dữ liệu đến từ đâu và khi nào."))}</p>
            {p.provenance.map((pr, i) => (
              <div key={i} className="border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mono rounded-[var(--radius-md)] bg-bg px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-text-2">{tr(sourceTypeLabels[pr.sourceType])}</span>
                  <span className="text-[0.9rem] text-text">{pr.sourceName}</span>
                  {pr.confidence != null && <span className="mono text-[0.68rem] text-text-2">conf {Math.round(pr.confidence * 100)}%</span>}
                  <span className="mono ml-auto text-[0.66rem] text-text-2">{new Date(pr.fetchedAt).toLocaleDateString()}</span>
                </div>
                {pr.note && <p className="mt-1 text-[0.82rem] italic text-text-2">{tr(pr.note)}</p>}
                {pr.sourceUrl && <a href={pr.sourceUrl} target="_blank" rel="noreferrer" className="mono mt-1 inline-block text-[0.7rem] text-accent">{pr.sourceUrl}</a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Facts({ title, items }: { title: string; items: string[] }) {
  return <div className="border border-border bg-surface p-4"><div className="label mb-1 text-text-2">{title}</div><div className="text-[0.92rem] text-text">{items.join(" · ") || "—"}</div></div>;
}

function ReviewsTab({ slug, reviews }: { slug: string; reviews: Review[] }) {
  const { tr } = useLang();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [size, setSize] = useState<CompanySize>("sme");
  const [industry, setIndustry] = useState("technology");
  const [role, setRole] = useState("");
  const [done, setDone] = useState(false);

  function submit() {
    if (!title.trim()) return;
    addReview(slug, { rating, title: title.trim(), pros: pros.trim(), cons: cons.trim(), companySize: size, industry, role: role.trim() });
    setTitle(""); setPros(""); setCons(""); setRole(""); setDone(true);
  }
  const field = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-[0.92rem] text-text-2">{tr(t("No reviews yet — be the first.", "Chưa có đánh giá — hãy là người đầu tiên."))}</p>}
        {reviews.map((r) => (
          <div key={r.id} className="border border-border bg-surface p-4">
            <div className="flex items-center gap-2"><span style={{ color: "#C9A227" }}>{"★".repeat(r.rating)}<span className="text-border">{"★".repeat(5 - r.rating)}</span></span><span className="font-medium text-text">{r.title}</span></div>
            <div className="mono mt-1 text-[0.66rem] uppercase tracking-wider text-text-2">{r.companySize} · {r.industry}{r.role ? ` · ${r.role}` : ""}</div>
            {r.pros && <p className="mt-2 text-[0.86rem] text-text"><span className="text-ok">+ </span>{r.pros}</p>}
            {r.cons && <p className="mt-1 text-[0.86rem] text-text"><span className="text-err">− </span>{r.cons}</p>}
          </div>
        ))}
      </div>
      <div className="border border-border bg-surface p-5">
        <h3 className="mb-3 font-medium text-text">{tr(t("Write a review", "Viết đánh giá"))}</h3>
        {done && <div className="mb-3 rounded-[var(--radius-md)] border border-ok/40 bg-ok/5 px-3 py-2 text-[0.82rem] text-ok">{tr(t("Thanks — your review is published.", "Cảm ơn — đánh giá đã đăng."))}</div>}
        <div className="mb-3 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className="text-[1.3rem]" style={{ color: n <= rating ? "#C9A227" : "var(--color-border)" }}>★</button>)}</div>
        <div className="space-y-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr(t("Title", "Tiêu đề"))} className={field} />
          <input value={pros} onChange={(e) => setPros(e.target.value)} placeholder={tr(t("Pros", "Ưu điểm"))} className={field} />
          <input value={cons} onChange={(e) => setCons(e.target.value)} placeholder={tr(t("Cons", "Nhược điểm"))} className={field} />
          <div className="grid grid-cols-2 gap-2">
            <select value={size} onChange={(e) => setSize(e.target.value as CompanySize)} className={field}><option value="startup">Startup</option><option value="sme">SME</option><option value="enterprise">Enterprise</option></select>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder={tr(t("Your role", "Vai trò"))} className={field} />
          </div>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={tr(t("Industry", "Ngành"))} className={field} />
          <button onClick={submit} disabled={!title.trim()} className={buttonClass("primary", "sm") + " w-full"}>{tr(t("Submit review", "Gửi đánh giá"))}</button>
        </div>
      </div>
    </div>
  );
}
