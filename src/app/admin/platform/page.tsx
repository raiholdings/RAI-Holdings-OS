"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import {
  hydrateStore, useSubmissions, useIngestion, useSources,
  approveSubmission, rejectSubmission, addIngestionSuggestions, approveIngestion, rejectIngestion, toggleSource,
  type IngestionSuggestion,
} from "@/lib/platform-store";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
type Tab = "submissions" | "ingestion" | "sources";

export default function AdminPlatform() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("submissions");
  useEffect(() => { hydrateStore(); }, []);
  const submissions = useSubmissions();
  const ingestion = useIngestion();
  const subPending = useMemo(() => submissions.filter((s) => s.status === "pending").length, [submissions]);
  const ingPending = useMemo(() => ingestion.filter((s) => s.status === "pending").length, [ingestion]);

  const tabs: { id: Tab; label: ReturnType<typeof t>; badge?: number }[] = [
    { id: "submissions", label: t("Submissions", "Đề xuất cộng đồng"), badge: subPending },
    { id: "ingestion", label: t("AI ingestion", "AI tổng hợp"), badge: ingPending },
    { id: "sources", label: t("Sources", "Nguồn") },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · platform catalog", "Quản trị · catalog nền tảng"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Platform admin", "Quản trị nền tảng"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>{tr(tb.label)}{tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}</button>)}
      </nav>
      {tab === "submissions" && <SubmissionsTab />}
      {tab === "ingestion" && <IngestionTab />}
      {tab === "sources" && <SourcesTab />}
    </main>
  );
}

function SubmissionsTab() {
  const { tr } = useLang();
  const submissions = useSubmissions();
  if (submissions.length === 0) return <Empty text={tr(t("No submissions yet.", "Chưa có đề xuất."))} />;
  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <div key={s.id} className="border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text">{s.data.name}</span>
            <span className="mono text-[0.68rem] text-text-2">{s.data.websiteUrl}</span>
            <StatusBadge status={s.status} />
          </div>
          <p className="mt-2 text-[0.88rem] text-text-2">{s.data.shortDescription || "—"}</p>
          <div className="mono mt-1 text-[0.68rem] uppercase tracking-wider text-text-2">{s.data.categorySlug} · {s.data.pricingModel} · {s.data.deployment}</div>
          {s.status === "pending" && (
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => rejectSubmission(s.id, "Rejected")} className={buttonClass("outline", "sm")}><Icon name="x" size={14} />{tr(t("Reject", "Từ chối"))}</button>
              <button onClick={() => approveSubmission(s.id)} className={buttonClass("primary", "sm")}><Icon name="check" size={14} />{tr(t("Approve & publish", "Duyệt & công khai"))}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IngestionTab() {
  const { tr } = useLang();
  const ingestion = useIngestion();
  const [msg, setMsg] = useState("");

  async function run() {
    setMsg("…");
    try {
      const res = await fetch("/api/platform/v0/ai/ingest", { method: "POST" });
      const data = await res.json();
      if (data.suggestions?.length) addIngestionSuggestions(data.suggestions.map((s: Omit<IngestionSuggestion, "id" | "status" | "createdAt">) => ({ ...s })));
      setMsg(`+${data.suggestions?.length ?? 0} (${data.source})${data.blocked?.length ? `, ${data.blocked.length} blocked` : ""}`);
    } catch { setMsg("error"); }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 border border-dashed border-border bg-surface p-4">
        <Icon name="sparkles" size={18} className="text-accent" />
        <div className="flex-1"><div className="font-medium text-text">{tr(t("Run ingestion pipeline", "Chạy pipeline tổng hợp"))}</div><div className="text-[0.82rem] text-text-2">{tr(t("Normalizes factual data from allowed sources, dedupes, and queues suggestions. Never auto-publishes.", "Chuẩn hóa dữ kiện từ nguồn được phép, khử trùng và đưa vào hàng đợi. Không tự công khai."))}</div></div>
        <button onClick={run} className={buttonClass("primary", "sm")}><Icon name="sparkles" size={14} />{tr(t("Run", "Chạy"))}</button>
        {msg && <span className="mono text-[0.72rem] text-text-2">{msg}</span>}
      </div>
      {ingestion.length === 0 ? <Empty text={tr(t("No AI suggestions yet. Run the pipeline.", "Chưa có đề xuất AI. Chạy pipeline."))} /> : (
        <div className="space-y-3">
          {ingestion.map((s) => (
            <div key={s.id} className="border border-border bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="mono rounded-[var(--radius-md)] bg-accent/15 px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider text-accent">{s.type}</span>
                {s.platformSlug && <span className="mono text-[0.68rem] text-text-2">→ {s.platformSlug}</span>}
                <span className="mono text-[0.68rem] text-text-2">conf {Math.round(s.confidence * 100)}%</span>
                <StatusBadge status={s.status} />
              </div>
              <p className="mb-2 text-[0.9rem] text-text-2"><span className="label mr-1 text-accent">{tr(t("Rationale", "Lý do"))}</span>{s.rationale}</p>
              <pre className="mono max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-ok/40 bg-ok/5 p-3 text-[0.7rem] text-text">{JSON.stringify(s.proposedData, null, 2)}</pre>
              <div className="mono mt-2 text-[0.66rem] text-text-2">{tr(t("Source", "Nguồn"))}: {s.provenance.map((p) => p.sourceName).join(", ")}</div>
              {s.status === "pending" && (
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => rejectIngestion(s.id, "Rejected")} className={buttonClass("outline", "sm")}><Icon name="x" size={14} />{tr(t("Reject", "Từ chối"))}</button>
                  <button onClick={() => approveIngestion(s.id)} className={buttonClass("primary", "sm")}><Icon name="check" size={14} />{s.type === "new_platform" ? tr(t("Approve & publish", "Duyệt & công khai")) : tr(t("Approve", "Duyệt"))}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesTab() {
  const { tr } = useLang();
  const sources = useSources();
  return (
    <div>
      <p className="mb-4 text-[0.86rem] text-text-2">{tr(t("Only sources marked allowed (terms + robots reviewed) are used by the pipeline.", "Chỉ nguồn được đánh dấu cho phép (đã rà điều khoản + robots) mới được pipeline dùng."))}</p>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border border-border bg-surface p-3">
            <div><div className="text-[0.9rem] text-text">{s.name}</div><div className="mono text-[0.66rem] text-text-2">{s.method} · {s.baseUrl}</div></div>
            <button onClick={() => toggleSource(s.id)} className={cn("rounded-[var(--radius-md)] border px-3 py-1.5 text-[0.8rem]", s.allowed ? "border-ok/40 bg-ok/10 text-ok" : "border-border text-text-2")}>{s.allowed ? tr(t("Allowed", "Được phép")) : tr(t("Blocked", "Chặn"))}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) { return <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{text}</div>; }
function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const { tr } = useLang();
  const map = { approved: ["bg-ok/15 text-ok", t("Approved", "Đã duyệt")], pending: ["bg-warn/20 text-warn", t("Pending", "Chờ duyệt")], rejected: ["bg-err/15 text-err", t("Rejected", "Từ chối")] } as const;
  const [cls, label] = map[status];
  return <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider", cls)}>{tr(label)}</span>;
}
