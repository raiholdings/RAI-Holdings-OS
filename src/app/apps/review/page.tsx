"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useSubmissions, updateSubmission, validateSubmission, type Submission, type SubmissionStatus } from "@/lib/apps-store";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const statusTone: Record<SubmissionStatus, string> = {
  draft: "var(--color-text-2)", submitted: "var(--color-holdings)", in_review: "var(--color-warn)", approved: "var(--color-ok)", rejected: "var(--color-err)",
};
const checklistLabels: { key: keyof Submission["checklist"]; label: T }[] = [
  { key: "scoped", label: t("Clearly scoped — one job, done well", "Phạm vi rõ — một việc, làm tốt") },
  { key: "visual", label: t("Visual & useful in chat", "Trực quan & hữu ích trong chat") },
  { key: "valuable", label: t("Delivers real value", "Mang giá trị thật") },
];

export default function ReviewQueue() {
  const { tr } = useLang();
  const subs = useSubmissions();

  return (
    <>
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Phase 4 · Review queue", "Phase 4 · Hàng đợi duyệt"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("App review", "Duyệt ứng dụng"))}</h1>
        <p className="mt-3 text-[0.98rem] text-text-2">{tr(t("Validate, run the curation checklist, and approve apps into the directory.", "Validate, chạy checklist kiểm duyệt, và duyệt app vào thư mục."))}</p>
      </div>

      {subs.length === 0 && (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">
          {tr(t("No submissions yet.", "Chưa có app nào được nộp."))} <Link href="/apps/submit" className="font-medium text-accent">{tr(t("Submit one →", "Nộp một app →"))}</Link>
        </div>
      )}

      <div className="mt-8 grid gap-4">
        {subs.map((s) => <ReviewCard key={s.id} s={s} />)}
      </div>
    </>
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
            <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{s.name || tr(t("(untitled)", "(chưa đặt tên)"))}</h3>
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
