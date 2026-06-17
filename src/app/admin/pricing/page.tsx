"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { getPricingPage, planPrice, type ComparisonGroup, type Plan, type PricingPage } from "@/lib/pricing";
import {
  hydrateStore, effectivePricing,
  useDraft, useSuggestions, useVersions, useContributors,
  updatePlan, setRecommended, movePlan, removePlan, addPlan,
  updateComparison, updateBanner, updateHero, setPageStatus, saveVersion, rollback,
  addSuggestions, approveSuggestion, rejectSuggestion, type Suggestion,
} from "@/lib/pricing-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";
type Tab = "plans" | "compare" | "content" | "review" | "versions" | "contributors";
const seed = getPricingPage();

export default function AdminPricing() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("plans");
  useEffect(() => { hydrateStore(); }, []);
  useDraft();
  const page = effectivePricing(seed);
  const suggestions = useSuggestions();
  const pending = useMemo(() => suggestions.filter((s) => s.status === "pending").length, [suggestions]);

  const tabs: { id: Tab; label: ReturnType<typeof t>; badge?: number }[] = [
    { id: "plans", label: t("Plans", "Gói") },
    { id: "compare", label: t("Compare", "So sánh") },
    { id: "content", label: t("Banner & hero", "Banner & hero") },
    { id: "review", label: t("Review queue", "Hàng đợi duyệt"), badge: pending },
    { id: "versions", label: t("Versions", "Phiên bản") },
    { id: "contributors", label: t("Contributors", "Người đóng góp") },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · pricing", "Quản trị · bảng giá"))}</div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Pricing content", "Nội dung bảng giá"))}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/pricing" target="_blank" className={buttonClass("ghost", "sm")}>{tr(t("Preview", "Xem"))}</Link>
          <button onClick={() => saveVersion(seed, "Manual snapshot")} className={buttonClass("outline", "sm")}>{tr(t("Save version", "Lưu phiên bản"))}</button>
          {page.status === "published"
            ? <button onClick={() => setPageStatus(seed, "draft")} className={buttonClass("outline", "sm")}>{tr(t("Unpublish", "Hủy xuất bản"))}</button>
            : <button onClick={() => setPageStatus(seed, "published")} className={buttonClass("primary", "sm")}>{tr(t("Publish", "Xuất bản"))}</button>}
        </div>
      </div>
      <div className="accent-rule my-5" />

      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
            {tr(tb.label)}{tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}
          </button>
        ))}
      </nav>

      {tab === "plans" && <PlansTab page={page} />}
      {tab === "compare" && <CompareTab page={page} />}
      {tab === "content" && <ContentTab page={page} />}
      {tab === "review" && <ReviewTab page={page} onApprove={(id) => approveSuggestion(seed, id)} />}
      {tab === "versions" && <VersionsTab />}
      {tab === "contributors" && <ContributorsTab />}
    </main>
  );
}

/* ------------------------------ Plans ----------------------------------- */
function PlansTab({ page }: { page: PricingPage }) {
  const { tr } = useLang();
  return (
    <div>
      <div className="mb-4 flex justify-end"><button onClick={() => addPlan(seed)} className={buttonClass("outline", "sm")}><Icon name="check" size={14} />{tr(t("Add plan", "Thêm gói"))}</button></div>
      <div className="space-y-3">{page.plans.map((p, i) => <PlanRow key={p.key} plan={p} first={i === 0} last={i === page.plans.length - 1} />)}</div>
    </div>
  );
}

function PlanRow({ plan, first, last }: { plan: Plan; first: boolean; last: boolean }) {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => JSON.stringify(plan, null, 2));
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const price = planPrice(plan, "monthly");

  function applyJson() {
    try { const parsed = JSON.parse(draft) as Partial<Plan>; updatePlan(seed, plan.key, parsed); setErr(""); setOpen(false); }
    catch { setErr(tr(t("Invalid JSON", "JSON không hợp lệ"))); }
  }
  async function runAi() {
    setMsg("…");
    try {
      const res = await fetch("/api/pricing/v0/ai/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ planKey: plan.key }) });
      const data = await res.json();
      if (data.drafts?.length) addSuggestions(data.drafts.map((d: Omit<Suggestion, "id" | "status" | "createdAt">) => ({ ...d })));
      setMsg(`+${data.drafts?.length ?? 0} (${data.source})${data.blocked?.length ? `, ${data.blocked.length} blocked` : ""}`);
    } catch { setMsg("error"); }
  }

  return (
    <div className={cn("border bg-surface", plan.recommended ? "border-accent" : "border-border")}>
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text">{tr(plan.name)}</span>
          <span className="mono text-[0.66rem] text-text-2">{plan.key} · {plan.kind}</span>
          {plan.recommended && <span className="mono rounded-[var(--radius-md)] bg-accent px-1.5 text-[0.6rem] uppercase text-white">rec</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => movePlan(seed, plan.key, -1)} disabled={first} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 disabled:opacity-30 hover:text-text">↑</button>
          <button onClick={() => movePlan(seed, plan.key, 1)} disabled={last} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 disabled:opacity-30 hover:text-text">↓</button>
          <button onClick={() => setRecommended(seed, plan.key)} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 hover:text-text">{tr(t("Recommend", "Đề xuất"))}</button>
          <button onClick={runAi} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-accent hover:bg-accent/10"><Icon name="sparkles" size={13} className="inline" /> AI</button>
          <button onClick={() => { setDraft(JSON.stringify(plan, null, 2)); setOpen((o) => !o); }} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 hover:text-text">{open ? tr(t("Close", "Đóng")) : tr(t("Edit", "Sửa"))}</button>
          <button onClick={() => removePlan(seed, plan.key)} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-err hover:bg-err/10">✕</button>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4 border-t border-border p-3">
        <PriceInput label={tr(t("Monthly (VND)", "Tháng (VND)"))} value={plan.priceMonthly} onChange={(v) => updatePlan(seed, plan.key, { priceMonthly: v })} />
        <PriceInput label={tr(t("Yearly (VND)", "Năm (VND)"))} value={plan.priceYearly} onChange={(v) => updatePlan(seed, plan.key, { priceYearly: v })} />
        <div className="text-[0.8rem] text-text-2">{tr(t("Shown", "Hiển thị"))}: <span className="font-medium text-text">{price.amount}</span></div>
        {msg && <span className="mono text-[0.7rem] text-text-2">{msg}</span>}
      </div>
      {open && (
        <div className="border-t border-border p-3">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={12} className="mono w-full rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[0.74rem] text-text outline-none focus:border-border-strong" spellCheck={false} />
          {err && <div className="mt-1 text-[0.8rem] text-err">{err}</div>}
          <div className="mt-2 flex justify-end gap-2"><button onClick={() => { setDraft(JSON.stringify(plan, null, 2)); setErr(""); }} className={buttonClass("ghost", "sm")}>{tr(t("Reset", "Đặt lại"))}</button><button onClick={applyJson} className={buttonClass("primary", "sm")}>{tr(t("Apply", "Áp dụng"))}</button></div>
        </div>
      )}
    </div>
  );
}

function PriceInput({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="block">
      <span className="label mb-1 block text-text-2">{label}</span>
      <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="w-36 rounded-[var(--radius-md)] border border-border bg-bg px-2 py-1.5 text-[0.85rem] text-text outline-none focus:border-border-strong" />
    </label>
  );
}

/* ------------------------------ Compare --------------------------------- */
function CompareTab({ page }: { page: PricingPage }) {
  const { tr } = useLang();
  const [draft, setDraft] = useState(() => JSON.stringify(page.comparison, null, 2));
  const [err, setErr] = useState("");
  function apply() {
    try { const parsed = JSON.parse(draft) as ComparisonGroup[]; updateComparison(seed, parsed); setErr(""); }
    catch { setErr(tr(t("Invalid JSON", "JSON không hợp lệ"))); }
  }
  return (
    <div className="border border-border bg-surface p-4">
      <p className="mb-2 text-[0.86rem] text-text-2">{tr(t("Edit comparison groups, rows, and per-plan values (yes/no/text).", "Sửa nhóm so sánh, dòng và giá trị theo từng gói (yes/no/text)."))}</p>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={20} className="mono w-full rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[0.74rem] text-text outline-none focus:border-border-strong" spellCheck={false} />
      {err && <div className="mt-1 text-[0.8rem] text-err">{err}</div>}
      <div className="mt-2 flex justify-end gap-2"><button onClick={() => setDraft(JSON.stringify(page.comparison, null, 2))} className={buttonClass("ghost", "sm")}>{tr(t("Reset", "Đặt lại"))}</button><button onClick={apply} className={buttonClass("primary", "sm")}>{tr(t("Apply", "Áp dụng"))}</button></div>
    </div>
  );
}

/* ------------------------------ Banner & hero --------------------------- */
function ContentTab({ page }: { page: PricingPage }) {
  const { tr } = useLang();
  const [b, setB] = useState(page.trialBanner);
  const [ht, setHt] = useState(page.heroTitle);
  const [hs, setHs] = useState(page.heroSubtitle);
  const field = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";
  const lbl = "label mb-1 block text-text-2";
  return (
    <div className="space-y-6">
      <div className="border border-border bg-surface p-4">
        <h3 className="mb-3 font-medium text-text">{tr(t("Trial banner", "Banner dùng thử"))}</h3>
        <label className="mb-3 flex items-center gap-2 text-[0.88rem] text-text"><input type="checkbox" checked={b.enabled} onChange={(e) => setB({ ...b, enabled: e.target.checked })} />{tr(t("Enabled", "Bật"))}</label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><span className={lbl}>Text (EN)</span><input value={b.text.en} onChange={(e) => setB({ ...b, text: { ...b.text, en: e.target.value } })} className={field} /></div>
          <div><span className={lbl}>Text (VI)</span><input value={b.text.vi} onChange={(e) => setB({ ...b, text: { ...b.text, vi: e.target.value } })} className={field} /></div>
          <div><span className={lbl}>{tr(t("Link text (EN/VI)", "Chữ link (EN/VI)"))}</span><div className="flex gap-2"><input value={b.linkText.en} onChange={(e) => setB({ ...b, linkText: { ...b.linkText, en: e.target.value } })} className={field} /><input value={b.linkText.vi} onChange={(e) => setB({ ...b, linkText: { ...b.linkText, vi: e.target.value } })} className={field} /></div></div>
          <div><span className={lbl}>{tr(t("Link URL", "URL link"))}</span><input value={b.linkUrl} onChange={(e) => setB({ ...b, linkUrl: e.target.value })} className={field} /></div>
        </div>
        <div className="mt-3 flex justify-end"><button onClick={() => updateBanner(seed, b)} className={buttonClass("primary", "sm")}>{tr(t("Save banner", "Lưu banner"))}</button></div>
      </div>
      <div className="border border-border bg-surface p-4">
        <h3 className="mb-3 font-medium text-text">{tr(t("Hero", "Hero"))}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><span className={lbl}>{tr(t("Title (EN)", "Tiêu đề (EN)"))}</span><input value={ht.en} onChange={(e) => setHt({ ...ht, en: e.target.value })} className={field} /></div>
          <div><span className={lbl}>{tr(t("Title (VI)", "Tiêu đề (VI)"))}</span><input value={ht.vi} onChange={(e) => setHt({ ...ht, vi: e.target.value })} className={field} /></div>
          <div><span className={lbl}>{tr(t("Subtitle (EN)", "Phụ đề (EN)"))}</span><input value={hs.en} onChange={(e) => setHs({ ...hs, en: e.target.value })} className={field} /></div>
          <div><span className={lbl}>{tr(t("Subtitle (VI)", "Phụ đề (VI)"))}</span><input value={hs.vi} onChange={(e) => setHs({ ...hs, vi: e.target.value })} className={field} /></div>
        </div>
        <div className="mt-3 flex justify-end"><button onClick={() => updateHero(seed, ht, hs)} className={buttonClass("primary", "sm")}>{tr(t("Save hero", "Lưu hero"))}</button></div>
      </div>
    </div>
  );
}

/* ------------------------------ Review ---------------------------------- */
function ReviewTab({ page, onApprove }: { page: PricingPage; onApprove: (id: string) => void }) {
  const { tr } = useLang();
  const suggestions = useSuggestions();
  const [origin, setOrigin] = useState<"all" | "ai" | "community">("all");
  const rows = useMemo(() => suggestions.filter((s) => (origin === "all" ? true : s.origin === origin)), [suggestions, origin]);
  return (
    <div>
      <div className="mb-4 flex gap-1">
        {(["all", "ai", "community"] as const).map((o) => <button key={o} onClick={() => setOrigin(o)} className={cn("rounded-[var(--radius-md)] border px-3 py-1.5 text-[0.82rem]", origin === o ? "border-accent bg-surface text-text" : "border-border text-text-2 hover:text-text")}>{o === "all" ? tr(t("All", "Tất cả")) : o === "ai" ? "AI" : tr(t("Community", "Cộng đồng"))}</button>)}
      </div>
      {rows.length === 0 && <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{tr(t("No suggestions. Run AI on a plan or wait for community input.", "Chưa có đề xuất. Chạy AI trên một gói hoặc chờ cộng đồng."))}</div>}
      <div className="space-y-3">
        {rows.map((s) => {
          const plan = page.plans.find((p) => p.key === s.planKey);
          return (
            <div key={s.id} className="border border-border bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider", s.origin === "ai" ? "bg-accent/15 text-accent" : "bg-lab/15 text-lab")}>{s.origin}</span>
                <span className="mono text-[0.68rem] uppercase tracking-wider text-text-2">{s.target}</span>
                <span className="text-[0.88rem] text-text">{plan ? tr(plan.name) : s.planKey}</span>
              </div>
              <p className="mb-3 text-[0.9rem] text-text-2"><span className="label mr-1 text-accent">{tr(t("Rationale", "Lý do"))}</span>{s.rationale}</p>
              <pre className="mono max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-ok/40 bg-ok/5 p-3 text-[0.72rem] text-text">{JSON.stringify(s.proposedData, null, 2)}</pre>
              {s.status === "pending" ? (
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => rejectSuggestion(s.id, "Rejected by reviewer")} className={buttonClass("outline", "sm")}><Icon name="x" size={14} />{tr(t("Reject", "Từ chối"))}</button>
                  <button onClick={() => onApprove(s.id)} className={buttonClass("primary", "sm")}><Icon name="check" size={14} />{tr(t("Approve", "Duyệt"))}</button>
                </div>
              ) : <div className="mt-2 mono text-[0.7rem] uppercase tracking-wider text-text-2">{s.status}{s.reviewNote ? ` · ${s.reviewNote}` : ""}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Versions -------------------------------- */
function VersionsTab() {
  const { tr } = useLang();
  const versions = useVersions();
  if (versions.length === 0) return <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{tr(t("No versions yet. Created on publish, applying a suggestion, or saving a snapshot.", "Chưa có phiên bản. Tạo khi xuất bản, áp đề xuất hoặc lưu ảnh chụp."))}</div>;
  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 border border-border bg-surface p-3">
          <div><div className="text-[0.9rem] text-text">{v.note}</div><div className="mono text-[0.66rem] text-text-2">{new Date(v.createdAt).toLocaleString()} · {v.snapshot.plans.length} plans · {v.createdBy}</div></div>
          <button onClick={() => rollback(seed, v.id)} className={buttonClass("outline", "sm")}>{tr(t("Rollback", "Khôi phục"))}</button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Contributors ---------------------------- */
function ContributorsTab() {
  const { tr } = useLang();
  const contributors = useContributors();
  if (contributors.length === 0) return <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{tr(t("No contributors yet. They appear when the community submits via /pricing/contribute.", "Chưa có người đóng góp. Họ xuất hiện khi cộng đồng gửi qua /pricing/contribute."))}</div>;
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-[0.88rem]">
        <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Contributor", "Người đóng góp"))}</th><th className="p-3 font-medium">{tr(t("Type", "Loại"))}</th><th className="p-3 font-medium">{tr(t("Reputation", "Uy tín"))}</th><th className="p-3 font-medium">{tr(t("Approved", "Đã duyệt"))}</th><th className="p-3 font-medium">{tr(t("Rejected", "Từ chối"))}</th></tr></thead>
        <tbody>{contributors.map((c) => (<tr key={c.id} className="border-t border-border"><td className="p-3 text-text">{c.name}</td><td className="p-3 text-text-2">{c.type}</td><td className="p-3 font-medium text-text">{c.reputationScore}</td><td className="p-3 text-ok">{c.contributionsApproved}</td><td className="p-3 text-text-2">{c.contributionsRejected}</td></tr>))}</tbody>
      </table>
    </div>
  );
}
