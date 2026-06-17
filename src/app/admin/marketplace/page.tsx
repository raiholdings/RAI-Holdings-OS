"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { getApp } from "@/lib/apps";
import {
  hydrateStore, usePublisher, useMyListings,
  registerPublisher, verifyPublisher, publishListing, updateListing,
} from "@/lib/marketplace-store";
import {
  categoryLabels, compatLabels, typeLabels, formatVnd,
  type Category, type Compatibility, type Listing, type ListingStatus, type ListingType, type PricingPlan,
} from "@/lib/marketplace";
import { t as bi } from "@/lib/i18n-core";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
type Tab = "publish" | "review";

const ICONS = ["home", "sparkles", "bolt", "database", "send", "file-text", "cart", "robot"];
const COLORS = ["#2E75B6", "#C9A227", "#0F2A47", "#0F6E56", "#1D9E75", "#7A5CFF"];
const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";

const statusTone: Record<ListingStatus, string> = {
  approved: "var(--color-ok)", submitted: "var(--color-holdings)", in_review: "var(--color-warn)", rejected: "var(--color-err)", suspended: "var(--color-text-2)",
};
const checks: { key: string; label: T }[] = [
  { key: "scope", label: t("Clearly scoped & honest description", "Phạm vi rõ & mô tả trung thực") },
  { key: "price", label: t("Pricing valid (month + year)", "Giá hợp lệ (tháng + năm)") },
  { key: "nodupe", label: t("Not a confusing duplicate", "Không trùng lặp gây nhầm") },
];

export default function AdminMarketplace() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("publish");
  const listings = useMyListings();
  useEffect(() => { hydrateStore(); }, []);

  const pending = useMemo(
    () => listings.filter((l) => l.status === "submitted" || l.status === "in_review").length,
    [listings],
  );

  const tabs: { id: Tab; label: T; badge?: number }[] = [
    { id: "publish", label: t("Publish", "Niêm yết") },
    { id: "review", label: t("Review queue", "Hàng đợi duyệt"), badge: pending },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · marketplace", "Quản trị · chợ ứng dụng"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Marketplace", "Chợ ứng dụng"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
            {tr(tb.label)}
            {tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}
          </button>
        ))}
      </nav>
      {tab === "publish" && <PublishTab onPublished={() => setTab("review")} />}
      {tab === "review" && <ReviewTab listings={listings} onPublishAnother={() => setTab("publish")} />}
    </main>
  );
}

/* ----------------------------- Publish tab ------------------------------ */
function PublishTab({ onPublished }: { onPublished: () => void }) {
  const publisher = usePublisher();
  if (!publisher) return <RegisterPublisher />;
  return <Wizard onPublished={onPublished} />;
}

function RegisterPublisher() {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [type, setType] = useState<"individual" | "organization">("individual");
  return (
    <div>
      <p className="mb-5 max-w-2xl text-[0.92rem] text-text-2">{tr(t("Anyone can publish free listings. Only verified organizations can sell paid plans.", "Ai cũng niêm yết được listing miễn phí. Chỉ tổ chức đã xác thực mới bán gói trả phí."))}</p>
      <div className="max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <Field label={tr(t("Publisher name", "Tên nhà phát hành"))}><input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="OPC · Your name" /></Field>
        <div className="mt-4 flex gap-2">
          {(["individual", "organization"] as const).map((tp) => <button key={tp} onClick={() => setType(tp)} className={cn("flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-[0.84rem]", type === tp ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2")}>{tr(tp === "individual" ? t("Individual", "Cá nhân") : t("Organization", "Tổ chức"))}</button>)}
        </div>
        <button disabled={name.trim().length < 2} onClick={() => registerPublisher(name.trim(), type)} className="mt-5 w-full rounded-[var(--radius-md)] bg-accent py-2.5 text-[0.9rem] font-medium text-white disabled:opacity-50">{tr(t("Register", "Đăng ký"))}</button>
      </div>
    </div>
  );
}

function Wizard({ onPublished }: { onPublished: () => void }) {
  const { tr } = useLang();
  const publisher = usePublisher()!;
  const [done, setDone] = useState<string | null>(null);
  const [f, setF] = useState({
    type: "app" as ListingType, artifactKind: "app" as "app" | "mcp" | "workflow", artifactId: "property",
    name: "", tagline: "", description: "", icon: "home", color: "#2E75B6",
    category: "productivity" as Category, compat: ["rai_os"] as Compatibility[],
    freeFeatures: "Tính năng cơ bản", paidOn: false, paidName: "Pro", paidMonthly: "290000", paidYearly: "2900000", paidTrial: true, paidFeatures: "Không giới hạn\nHỗ trợ ưu tiên",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const slug = useMemo(() => f.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), [f.name]);

  function toggleCompat(c: Compatibility) {
    setF((s) => ({ ...s, compat: s.compat.includes(c) ? s.compat.filter((x) => x !== c) : [...s.compat, c] }));
  }

  async function validateArtifact(): Promise<boolean> {
    if (f.artifactKind === "app") return !!getApp(f.artifactId);
    if (f.artifactKind === "mcp") { try { return (await fetch(`/api/mcp/v0/servers/${encodeURIComponent(f.artifactId)}`)).ok; } catch { return false; } }
    return f.artifactId.trim().length > 1; // workflow: free-form
  }

  async function submit() {
    const errs: string[] = [];
    if (f.name.trim().length < 2) errs.push(tr(t("Name is required", "Cần tên")));
    if (f.tagline.trim().length < 5) errs.push(tr(t("Tagline is required", "Cần mô tả ngắn")));
    if (f.description.trim().length < 20) errs.push(tr(t("Description ≥20 chars", "Mô tả ≥20 ký tự")));
    if (f.paidOn && !publisher.verified) errs.push(tr(t("Paid plans require a verified organization", "Gói trả phí cần tổ chức xác thực")));
    if (!(await validateArtifact())) errs.push(tr(t("Artifact not found in /apps or /mcp", "Không tìm thấy artifact ở /apps hoặc /mcp")));
    if (errs.length) { setErrors(errs); return; }

    const plans: PricingPlan[] = [{ id: "free", name: bi("Free", "Miễn phí"), type: "free", priceMonthly: 0, priceYearly: 0, features: f.freeFeatures.split("\n").filter(Boolean).map((x) => bi(x, x)), hasFreeTrial: false, trialDays: 0, availableFor: "both" }];
    if (f.paidOn && publisher.verified) plans.push({ id: "pro", name: bi(f.paidName, f.paidName), type: "flat_rate", priceMonthly: Number(f.paidMonthly) || 0, priceYearly: Number(f.paidYearly) || 0, features: f.paidFeatures.split("\n").filter(Boolean).map((x) => bi(x, x)), hasFreeTrial: f.paidTrial, trialDays: 14, availableFor: "both" });

    const listing: Listing = {
      id: "lst-me-" + slug, slug, name: f.name.trim(), tagline: bi(f.tagline, f.tagline), description: bi(f.description, f.description),
      icon: f.icon, color: f.color, type: f.type, categories: [f.category], compatibility: f.compat, artifactRef: { kind: f.artifactKind, id: f.artifactId },
      publisherId: publisher.id, rating: 0, installCount: 0, status: "submitted", plans,
    };
    publishListing(listing);
    setDone(slug);
  }

  if (done) return (
    <div className="max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--color-ok) 14%, transparent)", color: "var(--color-ok)" }}><Icon name="check" size={24} /></span>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-[1.3rem] font-medium text-text">{tr(t("Submitted for review", "Đã nộp duyệt"))}</h2>
      <p className="mono mt-2 text-[0.78rem] text-text-2">{done} · submitted</p>
      <div className="mt-5 flex justify-center gap-2">
        <button onClick={onPublished} className={buttonClass("primary", "sm")}>{tr(t("Review queue", "Hàng đợi duyệt"))}</button>
        <button onClick={() => setDone(null)} className={buttonClass("outline", "sm")}>{tr(t("Publish another", "Niêm yết tiếp"))}</button>
      </div>
    </div>
  );

  return (
    <div>
      <p className="mb-6 max-w-2xl text-[0.92rem] text-text-2">{tr(t("Point to an artifact in /apps or /mcp and add commercial metadata.", "Trỏ tới artifact ở /apps hoặc /mcp và thêm metadata thương mại."))}</p>

      {/* publisher status */}
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        <span className="grid size-9 place-items-center rounded-full bg-accent text-[0.8rem] font-medium text-white">{publisher.name.slice(0, 2).toUpperCase()}</span>
        <div className="flex-1">
          <span className="text-[0.9rem] font-medium text-text">{publisher.name}</span>
          <span className="mono ml-2 text-[0.72rem] text-text-2">{publisher.type}</span>
        </div>
        {publisher.verified ? <span className="mono flex items-center gap-1 text-[0.74rem]" style={{ color: "var(--color-ok)" }}><Icon name="check" size={13} /> {tr(t("Verified", "Đã xác thực"))}</span>
          : publisher.type === "organization" ? <button onClick={verifyPublisher} className="rounded-[var(--radius-md)] bg-accent px-3 py-1.5 text-[0.8rem] font-medium text-white">{tr(t("Verify organization", "Xác thực tổ chức"))}</button>
          : <span className="text-[0.74rem] text-text-2">{tr(t("Individuals can publish free only", "Cá nhân chỉ niêm yết free"))}</span>}
      </div>

      <div className="mt-6 grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label={tr(t("Type", "Loại"))}>
            <select className={inp} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as ListingType })}>{(Object.keys(typeLabels) as ListingType[]).map((k) => <option key={k} value={k}>{tr(typeLabels[k])}</option>)}</select>
          </Field>
          <Field label={tr(t("Category", "Danh mục"))}>
            <select className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })}>{(Object.keys(categoryLabels) as Category[]).map((k) => <option key={k} value={k}>{tr(categoryLabels[k])}</option>)}</select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={tr(t("Artifact kind", "Loại artifact"))}>
            <select className={inp} value={f.artifactKind} onChange={(e) => setF({ ...f, artifactKind: e.target.value as typeof f.artifactKind })}><option value="app">/apps</option><option value="mcp">/mcp</option><option value="workflow">workflow</option></select>
          </Field>
          <Field label={tr(t("Artifact ID", "ID artifact"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.artifactId} onChange={(e) => setF({ ...f, artifactId: e.target.value })} placeholder={f.artifactKind === "mcp" ? "vn.rai/property-search" : "property"} /></Field>
        </div>
        <Field label={tr(t("Name", "Tên"))}><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label={tr(t("Tagline", "Mô tả ngắn"))}><input className={inp} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field>
        <Field label={tr(t("Description", "Mô tả"))}><textarea className={cn(inp, "min-h-[70px]")} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={tr(t("Icon", "Biểu tượng"))}>
            <div className="flex flex-wrap gap-1.5">{ICONS.map((ic) => <button key={ic} type="button" onClick={() => setF({ ...f, icon: ic })} className={cn("grid size-9 place-items-center rounded-[var(--radius-md)] border", f.icon === ic ? "border-accent text-accent" : "border-border text-text-2")}><Icon name={ic} size={17} /></button>)}</div>
          </Field>
          <Field label={tr(t("Compatibility", "Tương thích"))}>
            <div className="flex flex-wrap gap-1.5">{(Object.keys(compatLabels) as Compatibility[]).map((c) => <button key={c} type="button" onClick={() => toggleCompat(c)} className={cn("rounded-[var(--radius-md)] border px-2.5 py-1.5 text-[0.78rem]", f.compat.includes(c) ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2")}>{tr(compatLabels[c])}</button>)}</div>
          </Field>
        </div>
        <Field label={tr(t("Brand color", "Màu"))}><div className="flex gap-2">{COLORS.map((c) => <button key={c} type="button" onClick={() => setF({ ...f, color: c })} className={cn("size-8 rounded-full border-2", f.color === c ? "border-text" : "border-transparent")} style={{ background: c }} />)}</div></Field>

        {/* plans */}
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Free plan", "Gói miễn phí"))}</span>
          <textarea className={cn(inp, "mt-2 min-h-[52px] text-[0.82rem]")} value={f.freeFeatures} onChange={(e) => setF({ ...f, freeFeatures: e.target.value })} placeholder={tr(t("One feature per line", "Mỗi dòng một tính năng"))} />
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <label className="flex items-center gap-2 text-[0.86rem] text-text"><input type="checkbox" checked={f.paidOn} onChange={(e) => setF({ ...f, paidOn: e.target.checked })} disabled={!publisher.verified} className="accent-[var(--color-accent)]" /> {tr(t("Add a paid plan", "Thêm gói trả phí"))} {!publisher.verified && <span className="text-[0.72rem] text-text-2">({tr(t("verify org first", "xác thực tổ chức trước"))})</span>}</label>
          {f.paidOn && publisher.verified && (
            <div className="mt-3 grid gap-3">
              <div className="grid grid-cols-3 gap-3">
                <Field label={tr(t("Plan name", "Tên gói"))}><input className={inp} value={f.paidName} onChange={(e) => setF({ ...f, paidName: e.target.value })} /></Field>
                <Field label={tr(t("VND / month", "VND / tháng"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.paidMonthly} onChange={(e) => setF({ ...f, paidMonthly: e.target.value })} /></Field>
                <Field label={tr(t("VND / year", "VND / năm"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.paidYearly} onChange={(e) => setF({ ...f, paidYearly: e.target.value })} /></Field>
              </div>
              <div className="mono text-[0.72rem] text-text-2">{formatVnd(Number(f.paidMonthly) || 0)}/{tr(t("mo", "tháng"))} · {formatVnd(Number(f.paidYearly) || 0)}/{tr(t("yr", "năm"))}</div>
              <label className="flex items-center gap-2 text-[0.84rem] text-text"><input type="checkbox" checked={f.paidTrial} onChange={(e) => setF({ ...f, paidTrial: e.target.checked })} className="accent-[var(--color-accent)]" /> {tr(t("14-day free trial", "Dùng thử 14 ngày"))}</label>
              <textarea className={cn(inp, "min-h-[52px] text-[0.82rem]")} value={f.paidFeatures} onChange={(e) => setF({ ...f, paidFeatures: e.target.value })} />
            </div>
          )}
        </div>

        {errors.length > 0 && <ul className="mono grid gap-1 rounded-[var(--radius-md)] border p-3 text-[0.76rem]" style={{ borderColor: "var(--color-err)", color: "var(--color-err)", background: "color-mix(in srgb, var(--color-err) 8%, transparent)" }}>{errors.map((e, i) => <li key={i}>· {e}</li>)}</ul>}
        <button onClick={submit} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.92rem] font-medium text-white transition-colors hover:bg-fund">{tr(t("Submit listing", "Nộp niêm yết"))}</button>
      </div>
    </div>
  );
}

/* ----------------------------- Review tab ------------------------------- */
function ReviewTab({ listings, onPublishAnother }: { listings: Listing[]; onPublishAnother: () => void }) {
  const { tr } = useLang();
  return (
    <div>
      <p className="mb-6 max-w-2xl text-[0.92rem] text-text-2">{tr(t("Validate artifact + pricing, run the checklist, and approve listings onto the marketplace.", "Kiểm tra artifact + giá, chạy checklist, và duyệt listing lên marketplace."))}</p>
      {listings.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">{tr(t("No submissions.", "Chưa có niêm yết."))} <button onClick={onPublishAnother} className="font-medium text-accent">{tr(t("Publish one →", "Niêm yết →"))}</button></div>
      ) : (
        <div className="grid gap-4">{listings.map((l) => <ReviewCard key={l.id} l={l} />)}</div>
      )}
    </div>
  );
}

function ReviewCard({ l }: { l: Listing }) {
  const { tr } = useLang();
  const publisher = usePublisher();
  const [ck, setCk] = useState<Record<string, boolean>>({});
  const paid = l.plans.find((p) => p.type !== "free");
  const autoOk = (!paid || (paid.priceMonthly > 0 && paid.priceYearly > 0 && !!publisher?.verified)) && !!l.artifactRef.id;
  const canApprove = autoOk && checks.every((c) => ck[c.key]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: l.color, background: `color-mix(in srgb, ${l.color} 12%, transparent)` }}><Icon name={l.icon} size={22} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{l.name || tr(t("(untitled)", "(chưa đặt tên)"))}</h3>
            <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.62rem] uppercase" style={{ color: statusTone[l.status], background: `color-mix(in srgb, ${statusTone[l.status]} 12%, transparent)` }}>{l.status}</span>
            <span className="mono rounded-[var(--radius-sm)] bg-bg px-1.5 py-0.5 text-[0.58rem] uppercase text-text-2">{tr(typeLabels[l.type])}</span>
          </div>
          <p className="mt-0.5 text-[0.85rem] text-text-2">{tr(l.tagline)}</p>
          <p className="mono mt-1 text-[0.7rem] text-text-2">{l.artifactRef.kind}:{l.artifactRef.id} · {l.plans.map((p) => p.type === "free" ? "free" : formatVnd(p.priceMonthly) + "/mo").join(" · ")}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Auto checks", "Kiểm tra tự động"))}</span>
          <ul className="mono mt-2 grid gap-1.5 text-[0.74rem]">
            <Auto ok={!!l.artifactRef.id}>artifact ref</Auto>
            <Auto ok={!paid || (paid.priceMonthly > 0 && paid.priceYearly > 0)}>paid month+year</Auto>
            <Auto ok={!paid || !!publisher?.verified}>verified for paid</Auto>
          </ul>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Checklist", "Danh mục kiểm tra"))}</span>
          <ul className="mt-2 grid gap-2">{checks.map((c) => <li key={c.key}><label className="flex items-start gap-2 text-[0.82rem] text-text"><input type="checkbox" disabled={l.status === "approved"} checked={!!ck[c.key]} onChange={(e) => setCk((s) => ({ ...s, [c.key]: e.target.checked }))} className="mt-0.5 accent-[var(--color-accent)]" />{tr(c.label)}</label></li>)}</ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {l.status === "submitted" && <button onClick={() => updateListing(l.id, { status: "in_review" })} className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.84rem] font-medium text-white">{tr(t("Start review", "Bắt đầu duyệt"))}</button>}
        {(l.status === "submitted" || l.status === "in_review") && <>
          <button disabled={!canApprove} onClick={() => updateListing(l.id, { status: "approved" })} className={cn("rounded-[var(--radius-md)] px-4 py-2 text-[0.84rem] font-medium text-white", canApprove ? "" : "cursor-not-allowed opacity-50")} style={{ background: "var(--color-ok)" }}>{tr(t("Approve", "Duyệt"))}</button>
          <button onClick={() => updateListing(l.id, { status: "rejected" })} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reject", "Từ chối"))}</button>
        </>}
        {l.status === "approved" && <>
          <span className="text-[0.84rem]" style={{ color: "var(--color-ok)" }}>✓ {tr(t("Live", "Đã lên kệ"))} · <Link href={`/marketplace/${l.slug}`} className="font-medium underline">/{l.slug}</Link></span>
          <button onClick={() => updateListing(l.id, { status: "suspended" })} className="rounded-[var(--radius-md)] border border-border-strong px-3 py-1.5 text-[0.8rem] text-text">{tr(t("Suspend", "Đình chỉ"))}</button>
        </>}
        {(l.status === "rejected" || l.status === "suspended") && <button onClick={() => updateListing(l.id, { status: "in_review" })} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reopen", "Mở lại"))}</button>}
        {!canApprove && (l.status === "submitted" || l.status === "in_review") && <span className="text-[0.76rem] text-text-2">{tr(t("Pass auto-checks + checklist to approve.", "Qua auto-check + checklist mới duyệt."))}</span>}
      </div>
    </div>
  );
}

function Auto({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <li className="flex items-center gap-2" style={{ color: ok ? "var(--color-ok)" : "var(--color-err)" }}><Icon name={ok ? "check" : "x"} size={13} /> {children}</li>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[0.78rem] font-medium text-text-2">{label}</span>{children}</label>;
}
