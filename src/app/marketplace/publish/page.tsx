"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getApp } from "@/lib/apps";
import { usePublisher, registerPublisher, verifyPublisher, publishListing } from "@/lib/marketplace-store";
import { categoryLabels, compatLabels, typeLabels, formatVnd, type Category, type Compatibility, type Listing, type ListingType, type PricingPlan } from "@/lib/marketplace";
import { t as bi } from "@/lib/i18n-core";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const ICONS = ["home", "sparkles", "bolt", "database", "send", "file-text", "cart", "robot"];
const COLORS = ["#2E75B6", "#C9A227", "#0F2A47", "#0F6E56", "#1D9E75", "#7A5CFF"];

export default function PublishWizard() {
  const { tr } = useLang();
  const publisher = usePublisher();
  if (!publisher) return <RegisterPublisher />;
  return <Wizard />;
}

function RegisterPublisher() {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [type, setType] = useState<"individual" | "organization">("individual");
  return (
    <Wrap>
      <Head label={tr(t("Phase 4 · Publisher", "Phase 4 · Nhà phát hành"))} title={tr(t("Become a publisher", "Trở thành nhà phát hành"))} desc={tr(t("Anyone can publish free listings. Only verified organizations can sell paid plans.", "Ai cũng niêm yết được listing miễn phí. Chỉ tổ chức đã xác thực mới bán gói trả phí."))} />
      <div className="mx-auto mt-8 max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <Field label={tr(t("Publisher name", "Tên nhà phát hành"))}><input className={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="OPC · Your name" /></Field>
        <div className="mt-4 flex gap-2">
          {(["individual", "organization"] as const).map((tp) => <button key={tp} onClick={() => setType(tp)} className={cn("flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-[0.84rem]", type === tp ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2")}>{tr(tp === "individual" ? t("Individual", "Cá nhân") : t("Organization", "Tổ chức"))}</button>)}
        </div>
        <button disabled={name.trim().length < 2} onClick={() => registerPublisher(name.trim(), type)} className="mt-5 w-full rounded-[var(--radius-md)] bg-accent py-2.5 text-[0.9rem] font-medium text-white disabled:opacity-50">{tr(t("Register", "Đăng ký"))}</button>
      </div>
    </Wrap>
  );
}

function Wizard() {
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
    <Wrap>
      <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--color-ok) 14%, transparent)", color: "var(--color-ok)" }}><Icon name="check" size={24} /></span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[1.3rem] font-medium text-text">{tr(t("Submitted for review", "Đã nộp duyệt"))}</h1>
        <p className="mono mt-2 text-[0.78rem] text-text-2">{done} · submitted</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/marketplace/review" className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.85rem] font-medium text-white">{tr(t("Review queue", "Hàng đợi duyệt"))}</Link>
          <button onClick={() => setDone(null)} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.85rem] text-text">{tr(t("Publish another", "Niêm yết tiếp"))}</button>
        </div>
      </div>
    </Wrap>
  );

  return (
    <Wrap>
      <Head label={tr(t("Phase 4 · List a product", "Phase 4 · Niêm yết"))} title={tr(t("Publish a listing", "Niêm yết sản phẩm"))} desc={tr(t("Point to an artifact in /apps or /mcp and add commercial metadata.", "Trỏ tới artifact ở /apps hoặc /mcp và thêm metadata thương mại."))} />

      {/* publisher status */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
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
          <Field label={tr(t("Icon", "Icon"))}>
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
    </Wrap>
  );
}

const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";
function Wrap({ children }: { children: React.ReactNode }) { return <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">{children}</main>; }
function Head({ label, title, desc }: { label: string; title: string; desc: string }) {
  return <div className="max-w-2xl"><span className="accent-rule mb-4 text-accent" /><span className="label text-text-2">{label}</span><h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{title}</h1><p className="mt-3 text-[0.98rem] text-text-2">{desc}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[0.78rem] font-medium text-text-2">{label}</span>{children}</label>; }
