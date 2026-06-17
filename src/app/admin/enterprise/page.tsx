"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import {
  listPages, getPage, axisToUrl, axisLabels, blockTypeLabels, metrics, metricValue, getMetric,
  type EnterprisePage, type BlockType, type Axis, type BlockData,
} from "@/lib/enterprise";
import {
  hydrateStore, effectivePage,
  useOverride, useOverrides, useSuggestions, useVersions, useContributors, useMetricOverrides,
  addBlock, removeBlock, moveBlock, updateBlockData, setBlockStatus, setPageStatus, saveVersion, rollback,
  addSuggestions, approveSuggestion, rejectSuggestion, queueMetricRefresh,
  type Suggestion,
} from "@/lib/enterprise-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";
type Tab = "pages" | "editor" | "review" | "metrics" | "versions" | "contributors";
const ALL_BLOCKS: BlockType[] = ["hero", "metric_strip", "pain_solution", "feature_grid", "use_case_steps", "proof", "comparison", "faq", "cta_band"];

export default function AdminEnterprise() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("pages");
  const [editId, setEditId] = useState<string | null>(null);
  useEffect(() => { hydrateStore(); }, []);

  const suggestions = useSuggestions();
  const pendingCount = useMemo(() => suggestions.filter((s) => s.status === "pending").length, [suggestions]);

  const tabs: { id: Tab; label: ReturnType<typeof t>; badge?: number }[] = [
    { id: "pages", label: t("Pages", "Trang") },
    { id: "editor", label: t("Editor", "Soạn thảo") },
    { id: "review", label: t("Review queue", "Hàng đợi duyệt"), badge: pendingCount },
    { id: "metrics", label: t("Metrics", "Số liệu") },
    { id: "versions", label: t("Versions", "Phiên bản") },
    { id: "contributors", label: t("Contributors", "Người đóng góp") },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · content management", "Quản trị · quản lý nội dung"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Enterprise content", "Nội dung Enterprise"))}</h1>
      <div className="accent-rule my-5" />

      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
            {tr(tb.label)}
            {tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}
          </button>
        ))}
      </nav>

      {tab === "pages" && <PagesTab onEdit={(id) => { setEditId(id); setTab("editor"); }} />}
      {tab === "editor" && <EditorTab editId={editId} setEditId={setEditId} />}
      {tab === "review" && <ReviewTab />}
      {tab === "metrics" && <MetricsTab onQueued={() => setTab("review")} />}
      {tab === "versions" && <VersionsTab />}
      {tab === "contributors" && <ContributorsTab />}
    </main>
  );
}

/* ------------------------------ Pages ----------------------------------- */
function PagesTab({ onEdit }: { onEdit: (id: string) => void }) {
  const { tr } = useLang();
  const overrides = useOverrides();
  const pages = listPages();
  const [msg, setMsg] = useState<Record<string, string>>({});

  async function runAi(p: EnterprisePage) {
    setMsg((m) => ({ ...m, [p.id]: "…" }));
    try {
      const res = await fetch("/api/enterprise/v0/ai/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ axis: axisToUrl(p.axis), slug: p.slug }) });
      const data = await res.json();
      if (data.drafts?.length) {
        addSuggestions(data.drafts.map((d: Omit<Suggestion, "id" | "status" | "createdAt">) => ({ ...d })));
      }
      setMsg((m) => ({ ...m, [p.id]: `+${data.drafts?.length ?? 0} (${data.source})${data.blocked?.length ? `, ${data.blocked.length} blocked` : ""}` }));
    } catch { setMsg((m) => ({ ...m, [p.id]: "error" })); }
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-[0.88rem]">
        <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Page", "Trang"))}</th><th className="p-3 font-medium">{tr(t("Axis", "Trục"))}</th><th className="p-3 font-medium">{tr(t("Status", "Trạng thái"))}</th><th className="p-3 font-medium">{tr(t("Actions", "Hành động"))}</th></tr></thead>
        <tbody>
          {pages.map((p) => {
            const status = overrides[p.id]?.status ?? p.status;
            return (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 text-text">{tr(p.title)}<div className="mono text-[0.68rem] text-text-2">/{axisToUrl(p.axis)}/{p.slug}</div></td>
                <td className="p-3 text-text-2">{tr(axisLabels[p.axis])}</td>
                <td className="p-3"><StatusBadge status={status} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => onEdit(p.id)} className={buttonClass("outline", "sm")}>{tr(t("Edit", "Sửa"))}</button>
                    <Link href={`/enterprise/${axisToUrl(p.axis)}/${p.slug}`} target="_blank" className={buttonClass("ghost", "sm")}>{tr(t("Preview", "Xem"))}</Link>
                    <button onClick={() => runAi(p)} className={buttonClass("ghost", "sm")}><Icon name="sparkles" size={14} />{tr(t("AI draft", "Bản nháp AI"))}</button>
                    {msg[p.id] && <span className="mono text-[0.7rem] text-text-2">{msg[p.id]}</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ Editor ---------------------------------- */
function EditorTab({ editId, setEditId }: { editId: string | null; setEditId: (id: string) => void }) {
  const { tr } = useLang();
  const pages = listPages();
  const seed = pages.find((p) => p.id === editId) ?? null;
  if (!seed) {
    return (
      <div className="border border-border bg-surface p-6">
        <p className="mb-4 text-[0.92rem] text-text-2">{tr(t("Pick a page to edit.", "Chọn một trang để sửa."))}</p>
        <select onChange={(e) => setEditId(e.target.value)} defaultValue="" className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.9rem]">
          <option value="" disabled>{tr(t("Choose a page…", "Chọn trang…"))}</option>
          {pages.map((p) => <option key={p.id} value={p.id}>{p.title.en}</option>)}
        </select>
      </div>
    );
  }
  return <PageEditor seed={seed} />;
}

function PageEditor({ seed }: { seed: EnterprisePage }) {
  const { tr } = useLang();
  useOverride(seed.id);
  const page = effectivePage(seed);
  const [addType, setAddType] = useState<BlockType>("pain_solution");
  const blocks = [...page.blocks].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-border bg-surface p-4">
        <div><div className="font-medium text-text">{tr(page.title)}</div><div className="mono text-[0.68rem] text-text-2">/{axisToUrl(page.axis)}/{page.slug} · <StatusBadge status={page.status} inline /></div></div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/enterprise/${axisToUrl(page.axis)}/${page.slug}`} target="_blank" className={buttonClass("ghost", "sm")}>{tr(t("Preview", "Xem"))}</Link>
          <button onClick={() => saveVersion(seed, "Manual snapshot")} className={buttonClass("outline", "sm")}>{tr(t("Save version", "Lưu phiên bản"))}</button>
          {page.status === "published"
            ? <button onClick={() => setPageStatus(seed, "draft")} className={buttonClass("outline", "sm")}>{tr(t("Unpublish", "Hủy xuất bản"))}</button>
            : <button onClick={() => setPageStatus(seed, "published")} className={buttonClass("primary", "sm")}>{tr(t("Publish", "Xuất bản"))}</button>}
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((b, i) => <BlockEditor key={b.id} seed={seed} block={b} first={i === 0} last={i === blocks.length - 1} />)}
      </div>

      <div className="mt-5 flex items-center gap-2 border border-dashed border-border p-4">
        <select value={addType} onChange={(e) => setAddType(e.target.value as BlockType)} className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem]">
          {ALL_BLOCKS.map((bt) => <option key={bt} value={bt}>{tr(blockTypeLabels[bt])}</option>)}
        </select>
        <button onClick={() => addBlock(seed, addType)} className={buttonClass("outline", "sm")}><Icon name="check" size={14} />{tr(t("Add block", "Thêm khối"))}</button>
      </div>
    </div>
  );
}

function BlockEditor({ seed, block, first, last }: { seed: EnterprisePage; block: EnterprisePage["blocks"][number]; first: boolean; last: boolean }) {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => JSON.stringify(block.data, null, 2));
  const [err, setErr] = useState("");

  function apply() {
    try { const parsed = JSON.parse(draft) as BlockData; updateBlockData(seed, block.id, parsed); setErr(""); setOpen(false); }
    catch { setErr(tr(t("Invalid JSON", "JSON không hợp lệ"))); }
  }

  return (
    <div className="border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[0.68rem] text-text-2">{String(block.order).padStart(2, "0")}</span>
          <span className="font-medium text-text">{tr(blockTypeLabels[block.type])}</span>
          <SourceBadge source={block.source} />
          {block.status === "draft" && <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 text-[0.62rem] uppercase text-warn">draft</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => moveBlock(seed, block.id, -1)} disabled={first} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 disabled:opacity-30 hover:text-text">↑</button>
          <button onClick={() => moveBlock(seed, block.id, 1)} disabled={last} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 disabled:opacity-30 hover:text-text">↓</button>
          <button onClick={() => setBlockStatus(seed, block.id, block.status === "published" ? "draft" : "published")} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 hover:text-text">{block.status === "published" ? tr(t("Hide", "Ẩn")) : tr(t("Show", "Hiện"))}</button>
          <button onClick={() => setOpen((o) => !o)} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 hover:text-text">{open ? tr(t("Close", "Đóng")) : tr(t("Edit", "Sửa"))}</button>
          <button onClick={() => removeBlock(seed, block.id)} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-err hover:bg-err/10">✕</button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border p-3">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={10} className="mono w-full rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[0.78rem] text-text outline-none focus:border-border-strong" spellCheck={false} />
          {err && <div className="mt-1 text-[0.8rem] text-err">{err}</div>}
          <div className="mt-2 flex justify-end gap-2"><button onClick={() => { setDraft(JSON.stringify(block.data, null, 2)); setErr(""); }} className={buttonClass("ghost", "sm")}>{tr(t("Reset", "Đặt lại"))}</button><button onClick={apply} className={buttonClass("primary", "sm")}>{tr(t("Apply", "Áp dụng"))}</button></div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Review ---------------------------------- */
function ReviewTab() {
  const { tr } = useLang();
  const suggestions = useSuggestions();
  const pages = listPages();
  const [origin, setOrigin] = useState<"all" | "ai" | "community">("all");
  const rows = useMemo(() => suggestions.filter((s) => (origin === "all" ? true : s.origin === origin)), [suggestions, origin]);

  return (
    <div>
      <div className="mb-4 flex gap-1">
        {(["all", "ai", "community"] as const).map((o) => (
          <button key={o} onClick={() => setOrigin(o)} className={cn("rounded-[var(--radius-md)] border px-3 py-1.5 text-[0.82rem]", origin === o ? "border-accent bg-surface text-text" : "border-border text-text-2 hover:text-text")}>{o === "all" ? tr(t("All", "Tất cả")) : o === "ai" ? "AI" : tr(t("Community", "Cộng đồng"))}</button>
        ))}
      </div>
      {rows.length === 0 && <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{tr(t("No suggestions. Run “AI draft” on a page or wait for community contributions.", "Chưa có đề xuất. Chạy “Bản nháp AI” trên một trang hoặc chờ đóng góp cộng đồng."))}</div>}
      <div className="space-y-3">
        {rows.map((s) => {
          const seed = pages.find((p) => p.id === s.pageId);
          const currentBlock = seed && s.blockId ? effectivePage(seed).blocks.find((b) => b.id === s.blockId) : undefined;
          return (
            <div key={s.id} className="border border-border bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <SourceBadge source={s.origin} />
                <span className="mono text-[0.68rem] uppercase tracking-wider text-text-2">{s.type}</span>
                <span className="text-[0.88rem] text-text">{seed ? tr(seed.title) : s.metricKey ? `metric · ${s.metricKey}` : s.pageId}</span>
                <StatusBadge status={s.status === "pending" ? "draft" : s.status === "approved" ? "published" : "archived"} inline />
              </div>
              <p className="mb-3 text-[0.9rem] text-text-2"><span className="label mr-1 text-accent">{tr(t("Rationale", "Lý do"))}</span>{s.rationale}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {currentBlock && <DiffPane title={tr(t("Current", "Hiện tại"))} data={currentBlock.data} />}
                <DiffPane title={tr(t("Proposed", "Đề xuất"))} data={s.proposedData} highlight />
              </div>
              {s.status === "pending" && (
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => rejectSuggestion(s.id, "Rejected by reviewer")} className={buttonClass("outline", "sm")}><Icon name="x" size={14} />{tr(t("Reject", "Từ chối"))}</button>
                  <button onClick={() => approveSuggestion(seed ?? pages[0], s.id)} className={buttonClass("primary", "sm")}><Icon name="check" size={14} />{tr(t("Approve", "Duyệt"))}</button>
                </div>
              )}
              {s.reviewNote && <div className="mt-2 text-[0.8rem] text-text-2">{s.reviewNote}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiffPane({ title, data, highlight }: { title: string; data: unknown; highlight?: boolean }) {
  return (
    <div className={cn("rounded-[var(--radius-md)] border p-3", highlight ? "border-ok/40 bg-ok/5" : "border-border bg-bg")}>
      <div className="mono mb-1 text-[0.62rem] uppercase tracking-wider text-text-2">{title}</div>
      <pre className="mono max-h-56 overflow-auto whitespace-pre-wrap break-words text-[0.72rem] text-text">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

/* ------------------------------ Metrics --------------------------------- */
function MetricsTab({ onQueued }: { onQueued: () => void }) {
  const { tr } = useLang();
  const overrides = useMetricOverrides();
  const [msg, setMsg] = useState<Record<string, string>>({});

  function refresh(key: string) {
    const r = queueMetricRefresh(key);
    if (r.changed) { setMsg((m) => ({ ...m, [key]: tr(t("Queued for review", "Đã đưa vào hàng đợi")) })); setTimeout(onQueued, 600); }
    else setMsg((m) => ({ ...m, [key]: tr(t("No change", "Không đổi")) }));
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-[0.88rem]">
        <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Metric", "Số liệu"))}</th><th className="p-3 font-medium">{tr(t("Value", "Giá trị"))}</th><th className="p-3 font-medium">{tr(t("Source", "Nguồn"))}</th><th className="p-3 font-medium">{tr(t("Verified", "Đã xác minh"))}</th><th className="p-3 font-medium">{tr(t("Actions", "Hành động"))}</th></tr></thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.key} className="border-t border-border">
              <td className="p-3 text-text">{tr(m.label)}<div className="mono text-[0.66rem] text-text-2">{m.key}</div></td>
              <td className="p-3 font-medium text-text">{metricValue(m.key, overrides)}{m.unit ? ` ${tr(m.unit)}` : ""}</td>
              <td className="p-3"><span className="mono text-[0.72rem] text-text-2">{m.dataSource}{m.query ? ` · ${m.query}` : ""}</span></td>
              <td className="p-3">{getMetric(m.key)?.verified ? <Icon name="check" size={15} className="text-ok" /> : <Icon name="x" size={15} className="text-text-2" />}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {m.dataSource === "system_query" ? <button onClick={() => refresh(m.key)} className={buttonClass("outline", "sm")}><Icon name="trending-up" size={14} />{tr(t("Refresh from system", "Làm tươi từ hệ thống"))}</button> : <span className="mono text-[0.7rem] text-text-2">{tr(t("manual source", "nguồn thủ công"))}</span>}
                  {msg[m.key] && <span className="mono text-[0.7rem] text-text-2">{msg[m.key]}</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ Versions -------------------------------- */
function VersionsTab() {
  const { tr } = useLang();
  const versions = useVersions();
  const pages = listPages();
  const [pid, setPid] = useState<string>("all");
  const rows = useMemo(() => versions.filter((v) => (pid === "all" ? true : v.pageId === pid)), [versions, pid]);

  return (
    <div>
      <div className="mb-4">
        <select value={pid} onChange={(e) => setPid(e.target.value)} className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem]">
          <option value="all">{tr(t("All pages", "Tất cả trang"))}</option>
          {pages.map((p) => <option key={p.id} value={p.id}>{p.title.en}</option>)}
        </select>
      </div>
      {rows.length === 0 && <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{tr(t("No versions yet. They're created when you publish, apply a suggestion, or save a snapshot.", "Chưa có phiên bản. Chúng được tạo khi bạn xuất bản, áp đề xuất hoặc lưu ảnh chụp."))}</div>}
      <div className="space-y-2">
        {rows.map((v) => {
          const seed = pages.find((p) => p.id === v.pageId);
          return (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 border border-border bg-surface p-3">
              <div>
                <div className="text-[0.9rem] text-text">{seed ? tr(seed.title) : v.pageId} · <span className="text-text-2">{v.note}</span></div>
                <div className="mono text-[0.66rem] text-text-2">{new Date(v.createdAt).toLocaleString()} · {v.snapshot.length} blocks · {v.createdBy}</div>
              </div>
              {seed && <button onClick={() => rollback(seed, v.id)} className={buttonClass("outline", "sm")}>{tr(t("Rollback", "Khôi phục"))}</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Contributors ---------------------------- */
function ContributorsTab() {
  const { tr } = useLang();
  const contributors = useContributors();
  if (contributors.length === 0) return <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{tr(t("No contributors yet.", "Chưa có người đóng góp."))}</div>;
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-[0.88rem]">
        <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Contributor", "Người đóng góp"))}</th><th className="p-3 font-medium">{tr(t("Type", "Loại"))}</th><th className="p-3 font-medium">{tr(t("Reputation", "Uy tín"))}</th><th className="p-3 font-medium">{tr(t("Approved", "Đã duyệt"))}</th><th className="p-3 font-medium">{tr(t("Rejected", "Từ chối"))}</th></tr></thead>
        <tbody>
          {contributors.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="p-3 text-text">{c.name}</td>
              <td className="p-3 text-text-2">{c.type}</td>
              <td className="p-3 font-medium text-text">{c.reputationScore}</td>
              <td className="p-3 text-ok">{c.contributionsApproved}</td>
              <td className="p-3 text-text-2">{c.contributionsRejected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ badges ---------------------------------- */
function StatusBadge({ status, inline }: { status: "draft" | "published" | "archived"; inline?: boolean }) {
  const { tr } = useLang();
  const map = { published: ["bg-ok/15 text-ok", t("Published", "Đã xuất bản")], draft: ["bg-warn/20 text-warn", t("Draft", "Bản nháp")], archived: ["bg-border text-text-2", t("Archived", "Lưu trữ")] } as const;
  const [cls, label] = map[status];
  return <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider", cls, inline && "inline")}>{tr(label)}</span>;
}
function SourceBadge({ source }: { source: "manual" | "ai" | "community" }) {
  const map = { ai: "bg-accent/15 text-accent", community: "bg-lab/15 text-lab", manual: "bg-border text-text-2" } as const;
  return <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider", map[source])}>{source}</span>;
}
