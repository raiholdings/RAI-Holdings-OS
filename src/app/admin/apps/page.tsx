"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import {
  hydrateStore, useSubmissions, addSubmission, updateSubmission, validateSubmission,
  type Submission, type SubmissionScope, type SubmissionStatus,
} from "@/lib/apps-store";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
type Tab = "submit" | "review";

const CHECK_LABELS: Record<string, T> = {
  meta: t("Name & description present (≥20 chars)", "Có tên & mô tả (≥20 ký tự)"),
  endpoint: t("Valid MCP endpoint (https…/mcp)", "Endpoint /mcp hợp lệ (https…/mcp)"),
  ui: t("UI resource uses ui:// scheme", "UI resource dùng ui://"),
  fallback: t("Every tool has fallback text", "Mọi tool có fallback text"),
  scopes: t("At least one scope declared", "Khai báo ≥1 scope"),
};
const ICONS = ["home", "sparkles", "bolt", "cart", "database", "robot", "world", "stack"];
const COLORS = ["#2E75B6", "#C9A227", "#0F2A47", "#0F6E56", "#3B6D11", "#378ADD"];

const statusTone: Record<SubmissionStatus, string> = {
  draft: "var(--color-text-2)", submitted: "var(--color-holdings)", in_review: "var(--color-warn)", approved: "var(--color-ok)", rejected: "var(--color-err)",
};
const checklistLabels: { key: keyof Submission["checklist"]; label: T }[] = [
  { key: "scoped", label: t("Clearly scoped — one job, done well", "Phạm vi rõ — một việc, làm tốt") },
  { key: "visual", label: t("Visual & useful in chat", "Trực quan & hữu ích trong chat") },
  { key: "valuable", label: t("Delivers real value", "Mang giá trị thật") },
];

export default function AdminApps() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("submit");
  useEffect(() => { hydrateStore(); }, []);
  const subs = useSubmissions();
  const pending = useMemo(() => subs.filter((s) => s.status === "submitted" || s.status === "in_review").length, [subs]);

  const tabs: { id: Tab; label: T; badge?: number }[] = [
    { id: "submit", label: t("Submit", "Nộp") },
    { id: "review", label: t("Review queue", "Hàng đợi duyệt"), badge: pending },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · apps", "Quản trị · ứng dụng"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Apps", "Ứng dụng"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
            {tr(tb.label)}{tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}
          </button>
        ))}
      </nav>
      {tab === "submit" && <SubmitTab />}
      {tab === "review" && <ReviewTab subs={subs} />}
    </main>
  );
}

const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.78rem] font-medium text-text-2">{label}</span>
      {children}
    </label>
  );
}

function SubmitTab() {
  const { tr } = useLang();
  const [done, setDone] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "", tagline: "", description: "", category: "property" as "property" | "design" | "workflow",
    mcpEndpoint: "https://", uiResourceUri: "ui://", icon: "home", color: "#2E75B6", scopesRaw: "read:data|Đọc dữ liệu", hasFallback: false,
  });

  const scopes = useMemo<SubmissionScope[]>(() =>
    f.scopesRaw.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [id, label] = l.split("|");
      return { id: id.trim(), label: (label || id).trim() };
    }), [f.scopesRaw]);

  const checks = useMemo(() => validateSubmission({ ...f, scopes }), [f, scopes]);
  const allOk = checks.every((c) => c.ok);

  function submit() {
    const id = addSubmission({
      name: f.name, tagline: f.tagline, description: f.description, category: f.category,
      mcpEndpoint: f.mcpEndpoint, uiResourceUri: f.uiResourceUri, icon: f.icon, color: f.color, scopes, hasFallback: f.hasFallback,
    });
    setDone(id);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--color-ok) 14%, transparent)", color: "var(--color-ok)" }}><Icon name="check" size={24} /></span>
        <h2 className="mt-4 text-[1.3rem] font-medium text-text">{tr(t("Submitted for review", "Đã nộp để duyệt"))}</h2>
        <p className="mono mt-2 text-[0.78rem] text-text-2">{done} · status: submitted</p>
        <p className="mt-3 text-[0.88rem] text-text-2">{tr(t("Reviewers will validate and approve the app. Track it in the review queue.", "Đội duyệt sẽ kiểm tra và phê duyệt ứng dụng. Theo dõi ở hàng đợi duyệt."))}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => setDone(null)} className={buttonClass("primary", "sm")}>{tr(t("Submit another", "Nộp app khác"))}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* form */}
      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <Field label={tr(t("App name", "Tên ứng dụng"))}><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="RAI Calendar" /></Field>
        <Field label={tr(t("Tagline", "Mô tả ngắn"))}><input className={inp} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field>
        <Field label={tr(t("Description", "Mô tả"))}><textarea className={cn(inp, "min-h-[80px]")} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={tr(t("Category", "Danh mục"))}>
            <select className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as typeof f.category })}>
              <option value="property">{tr(t("Real estate", "Bất động sản"))}</option>
              <option value="design">{tr(t("Design", "Thiết kế"))}</option>
              <option value="workflow">Workflow</option>
            </select>
          </Field>
          <Field label={tr(t("Icon", "Icon"))}>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setF({ ...f, icon: ic })} className={cn("grid size-9 place-items-center rounded-[var(--radius-md)] border", f.icon === ic ? "border-accent text-accent" : "border-border text-text-2")}><Icon name={ic} size={17} /></button>
              ))}
            </div>
          </Field>
        </div>
        <Field label={tr(t("Brand color", "Màu thương hiệu"))}>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setF({ ...f, color: c })} className={cn("size-8 rounded-full border-2", f.color === c ? "border-text" : "border-transparent")} style={{ background: c }} />
            ))}
          </div>
        </Field>
        <Field label={tr(t("MCP server endpoint", "Endpoint MCP server"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.mcpEndpoint} onChange={(e) => setF({ ...f, mcpEndpoint: e.target.value })} placeholder="https://app.example.com/mcp" /></Field>
        <Field label={tr(t("UI resource URI", "UI resource URI"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.uiResourceUri} onChange={(e) => setF({ ...f, uiResourceUri: e.target.value })} placeholder="ui://vendor/widget" /></Field>
        <Field label={tr(t("Scopes (one per line: id|label)", "Scope (mỗi dòng: id|nhãn)"))}><textarea className={cn(inp, "min-h-[64px] font-[family-name:var(--font-mono)] text-[0.82rem]")} value={f.scopesRaw} onChange={(e) => setF({ ...f, scopesRaw: e.target.value })} /></Field>
        <label className="flex items-center gap-2 text-[0.86rem] text-text">
          <input type="checkbox" checked={f.hasFallback} onChange={(e) => setF({ ...f, hasFallback: e.target.checked })} className="accent-[var(--color-accent)]" />
          {tr(t("I confirm every tool returns fallback text", "Tôi xác nhận mọi tool đều trả fallback text"))}
        </label>
      </div>

      {/* validation panel */}
      <aside className="grid content-start gap-4">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <span className="label text-text-2">{tr(t("Auto-validation", "Validate tự động"))}</span>
          <ul className="mt-3 grid gap-2.5">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5 text-[0.85rem]">
                <span className="mt-0.5 flex-none" style={{ color: c.ok ? "var(--color-ok)" : "var(--color-text-2)" }}>
                  <Icon name={c.ok ? "check" : "point"} size={15} />
                </span>
                <span className={c.ok ? "text-text" : "text-text-2"}>{tr(CHECK_LABELS[c.id])}</span>
              </li>
            ))}
          </ul>
        </div>
        <button disabled={!allOk} onClick={submit} className={cn("rounded-[var(--radius-md)] px-5 py-3 text-[0.92rem] font-medium text-white transition-colors", allOk ? "bg-accent hover:bg-fund" : "cursor-not-allowed bg-border-strong")}>
          {allOk ? tr(t("Submit for review", "Nộp để duyệt")) : tr(t("Fix validation to submit", "Sửa lỗi để nộp"))}
        </button>
      </aside>
    </div>
  );
}

function ReviewTab({ subs }: { subs: Submission[] }) {
  const { tr } = useLang();
  if (subs.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">
        {tr(t("No submissions yet. Use the Submit tab to add one.", "Chưa có app nào được nộp. Dùng tab Nộp để thêm."))}
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      {subs.map((s) => <ReviewCard key={s.id} s={s} />)}
    </div>
  );
}

function ReviewCard({ s }: { s: Submission }) {
  const { tr } = useLang();
  const checks = validateSubmission(s);
  const autoOk = checks.every((c) => c.ok);
  const checklistOk = s.checklist.scoped && s.checklist.visual && s.checklist.valuable;
  const canApprove = autoOk && checklistOk;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: s.color, background: `color-mix(in srgb, ${s.color} 12%, transparent)` }}><Icon name={s.icon} size={22} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[1.1rem] font-medium text-text">{s.name || tr(t("(untitled)", "(chưa đặt tên)"))}</h3>
            <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem] uppercase" style={{ color: statusTone[s.status], background: `color-mix(in srgb, ${statusTone[s.status]} 12%, transparent)` }}>{s.status}</span>
          </div>
          <p className="mt-0.5 text-[0.86rem] text-text-2">{s.tagline}</p>
          <p className="mono mt-1 text-[0.7rem] text-text-2">{s.mcpEndpoint} · {s.uiResourceUri}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* auto checks */}
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Auto-validation", "Validate tự động"))}</span>
          <ul className="mono mt-2 grid gap-1.5 text-[0.74rem]">
            {checks.map((c) => (
              <li key={c.id} className="flex items-center gap-2" style={{ color: c.ok ? "var(--color-ok)" : "var(--color-err)" }}>
                <Icon name={c.ok ? "check" : "x"} size={13} /> {c.id}
              </li>
            ))}
          </ul>
        </div>
        {/* curation checklist */}
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Curation checklist", "Checklist kiểm duyệt"))}</span>
          <ul className="mt-2 grid gap-2">
            {checklistLabels.map((c) => (
              <li key={c.key}>
                <label className="flex items-start gap-2 text-[0.82rem] text-text">
                  <input type="checkbox" disabled={s.status === "approved" || s.status === "rejected"} checked={s.checklist[c.key]} onChange={(e) => updateSubmission(s.id, { checklist: { ...s.checklist, [c.key]: e.target.checked } })} className="mt-0.5 accent-[var(--color-accent)]" />
                  {tr(c.label)}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <textarea
        value={s.reviewerNote}
        onChange={(e) => updateSubmission(s.id, { reviewerNote: e.target.value })}
        placeholder={tr(t("Reviewer note…", "Ghi chú reviewer…"))}
        className="mt-4 min-h-[52px] w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.85rem] text-text outline-none focus:border-accent"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {s.status === "submitted" && (
          <button onClick={() => updateSubmission(s.id, { status: "in_review" })} className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.84rem] font-medium text-white">{tr(t("Start review", "Bắt đầu duyệt"))}</button>
        )}
        {(s.status === "submitted" || s.status === "in_review") && (
          <>
            <button disabled={!canApprove} onClick={() => updateSubmission(s.id, { status: "approved" })} className={cn("rounded-[var(--radius-md)] px-4 py-2 text-[0.84rem] font-medium text-white", canApprove ? "" : "cursor-not-allowed opacity-50")} style={{ background: "var(--color-ok)" }}>{tr(t("Approve", "Duyệt"))}</button>
            <button onClick={() => updateSubmission(s.id, { status: "rejected" })} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reject", "Từ chối"))}</button>
          </>
        )}
        {s.status === "approved" && <span className="text-[0.84rem]" style={{ color: "var(--color-ok)" }}>✓ {tr(t("Live in directory", "Đã lên thư mục"))} · <Link href="/apps" className="font-medium underline">/apps</Link></span>}
        {s.status === "rejected" && <button onClick={() => updateSubmission(s.id, { status: "in_review" })} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reopen", "Mở lại"))}</button>}
        {!canApprove && (s.status === "submitted" || s.status === "in_review") && (
          <span className="text-[0.78rem] text-text-2">{tr(t("Pass auto-validation + all checklist items to approve.", "Cần qua validate + đủ checklist mới duyệt được."))}</span>
        )}
      </div>
    </div>
  );
}
