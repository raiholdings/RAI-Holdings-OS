"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { allEntries, blockTypeLabels, pillarLabels, tabLabels, tabOrder, type ContentBlock, type Pillar, type PortfolioEntry, type PortfolioTab, type ProfileBlock } from "@/lib/portfolio";
import {
  hydrateStore, effectiveList, useNewEntries, useOverridesMap, useSuggestions, useVersions,
  addBlock, removeBlock, moveBlock, updateBlockData, setBlockStatus, setEntryStatus, setFeatured, saveVersion, rollback,
  addSuggestions, approveSuggestion, rejectSuggestion, type Suggestion,
} from "@/lib/portfolio-store";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
type Tab = "entries" | "editor" | "review" | "versions";
const ALL_BLOCKS: ProfileBlock["type"][] = ["overview", "models", "pricing_table", "use_cases", "ecosystem_links", "status", "contact_cta"];
const PILLARS: Pillar[] = ["tech_business", "saas_platform", "tech_transfer", "community_platform", "franchise_venture"];

export default function AdminPortfolio() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("entries");
  const [editId, setEditId] = useState<string | null>(null);
  useEffect(() => { hydrateStore(); }, []);
  useNewEntries(); useOverridesMap();
  const suggestions = useSuggestions();
  const pending = useMemo(() => suggestions.filter((s) => s.status === "pending").length, [suggestions]);
  const entries = effectiveList(allEntries());

  const tabs: { id: Tab; label: ReturnType<typeof t>; badge?: number }[] = [
    { id: "entries", label: t("Entries", "Danh mục") },
    { id: "editor", label: t("Profile editor", "Soạn hồ sơ") },
    { id: "review", label: t("Review queue", "Hàng đợi duyệt"), badge: pending },
    { id: "versions", label: t("Versions", "Phiên bản") },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · portfolio", "Quản trị · danh mục"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Ecosystem entries", "Mục hệ sinh thái"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>{tr(tb.label)}{tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}</button>)}
      </nav>
      {tab === "entries" && <EntriesTab entries={entries} onEdit={(id) => { setEditId(id); setTab("editor"); }} />}
      {tab === "editor" && <EditorTab entries={entries} editId={editId} setEditId={setEditId} />}
      {tab === "review" && <ReviewTab entries={entries} />}
      {tab === "versions" && <VersionsTab entries={entries} />}
    </main>
  );
}

function EntriesTab({ entries, onEdit }: { entries: PortfolioEntry[]; onEdit: (id: string) => void }) {
  const { tr } = useLang();
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [filterTab, setFilterTab] = useState<PortfolioTab | "all">("all");
  const rows = filterTab === "all" ? entries : entries.filter((e) => e.portfolioTab === filterTab);

  async function aiRefresh(e: PortfolioEntry) {
    setMsg((m) => ({ ...m, [e.id]: "…" }));
    try {
      const res = await fetch("/api/portfolio/v0/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "update_block", slug: e.slug }) });
      const data = await res.json();
      if (data.suggestions?.length) addSuggestions(data.suggestions.map((s: Omit<Suggestion, "id" | "status" | "createdAt">) => ({ ...s })));
      setMsg((m) => ({ ...m, [e.id]: `+${data.suggestions?.length ?? 0} (${data.source})` }));
    } catch { setMsg((m) => ({ ...m, [e.id]: "error" })); }
  }

  return (
    <div>
      <AiCreate />
      <div className="mb-3 flex gap-1">
        {(["all", ...tabOrder] as const).map((tb) => <button key={tb} onClick={() => setFilterTab(tb as PortfolioTab | "all")} className={cn("rounded-[var(--radius-md)] border px-2.5 py-1 text-[0.8rem]", filterTab === tb ? "border-accent bg-surface text-text" : "border-border text-text-2 hover:text-text")}>{tb === "all" ? tr(t("All", "Tất cả")) : tr(tabLabels[tb as PortfolioTab])}</button>)}
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-[0.86rem]">
          <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Entry", "Mục"))}</th><th className="p-3 font-medium">{tr(t("Pillar", "Trụ cột"))}</th><th className="p-3 font-medium">{tr(t("Status", "Trạng thái"))}</th><th className="p-3 font-medium">{tr(t("Actions", "Hành động"))}</th></tr></thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="p-3"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-[var(--radius-md)] text-[0.6rem] font-medium text-white" style={{ background: e.accent }}>{e.monogram}</span><span className="text-text">{e.name}</span>{e.featured && <Icon name="sparkles" size={13} className="text-warn" />}</div></td>
                <td className="p-3 text-text-2">{tr(pillarLabels[e.pillar])}</td>
                <td className="p-3"><StatusBadge status={e.status} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => onEdit(e.id)} className={buttonClass("outline", "sm")}>{tr(t("Edit", "Sửa"))}</button>
                    <Link href={`/portfolio/${e.slug}`} target="_blank" className={buttonClass("ghost", "sm")}>{tr(t("Preview", "Xem"))}</Link>
                    <button onClick={() => setFeatured(e, !e.featured)} className={buttonClass("ghost", "sm")}>{e.featured ? tr(t("Unfeature", "Bỏ nổi bật")) : tr(t("Feature", "Nổi bật"))}</button>
                    {e.status === "published" ? <button onClick={() => setEntryStatus(e, "draft")} className={buttonClass("ghost", "sm")}>{tr(t("Unpublish", "Hủy"))}</button> : <button onClick={() => setEntryStatus(e, "published")} className={buttonClass("primary", "sm")}>{tr(t("Publish", "Xuất bản"))}</button>}
                    <button onClick={() => aiRefresh(e)} className={buttonClass("ghost", "sm")}><Icon name="sparkles" size={13} />AI</button>
                    {msg[e.id] && <span className="mono text-[0.7rem] text-text-2">{msg[e.id]}</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AiCreate() {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [pillar, setPillar] = useState<Pillar>("tech_business");
  const [ptab, setPtab] = useState<PortfolioTab>("platforms");
  const [domain, setDomain] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  async function run() {
    if (!name.trim()) return;
    setMsg("…");
    try {
      const res = await fetch("/api/portfolio/v0/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "new_profile", input: { name: name.trim(), sector: sector.trim() || "Platform", pillar, tab: ptab, domain: domain.trim() || undefined, notes: notes.trim() } }) });
      const data = await res.json();
      if (data.suggestions?.length) addSuggestions(data.suggestions.map((s: Omit<Suggestion, "id" | "status" | "createdAt">) => ({ ...s })));
      setMsg(`${tr(t("Draft queued for review", "Đã đưa bản nháp vào hàng đợi"))} (${data.source})`);
      setName(""); setDomain(""); setNotes("");
    } catch { setMsg("error"); }
  }
  const field = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";
  return (
    <div className="mb-5 border border-dashed border-border bg-surface p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-[0.92rem] font-medium text-text"><Icon name="sparkles" size={16} className="text-accent" />{tr(t("Create an entry with AI", "Tạo mục bằng AI"))}<Icon name={open ? "x" : "arrow-up-right"} size={14} className="text-text-2" /></button>
      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr(t("Name", "Tên"))} className={field} />
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={tr(t("Domain (optional)", "Domain (tùy chọn)"))} className={field} />
          <input value={sector} onChange={(e) => setSector(e.target.value)} placeholder={tr(t("Sector (e.g. EdTech)", "Lĩnh vực (vd EdTech)"))} className={field} />
          <select value={pillar} onChange={(e) => setPillar(e.target.value as Pillar)} className={field}>{PILLARS.map((p) => <option key={p} value={p}>{pillarLabels[p].en}</option>)}</select>
          <select value={ptab} onChange={(e) => setPtab(e.target.value as PortfolioTab)} className={field}>{tabOrder.map((tb) => <option key={tb} value={tb}>{tabLabels[tb].en}</option>)}</select>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={tr(t("Notes (no fabricated figures)…", "Ghi chú (không bịa số)…"))} className={field + " sm:col-span-2"} />
          <div className="flex items-center gap-3 sm:col-span-2"><button onClick={run} disabled={!name.trim()} className={buttonClass("primary", "sm")}><Icon name="sparkles" size={14} />{tr(t("Generate draft", "Sinh bản nháp"))}</button>{msg && <span className="mono text-[0.72rem] text-text-2">{msg}</span>}</div>
        </div>
      )}
    </div>
  );
}

function EditorTab({ entries, editId, setEditId }: { entries: PortfolioEntry[]; editId: string | null; setEditId: (id: string) => void }) {
  const { tr } = useLang();
  const entry = entries.find((e) => e.id === editId) ?? null;
  if (!entry) return (
    <div className="border border-border bg-surface p-6">
      <p className="mb-4 text-[0.92rem] text-text-2">{tr(t("Pick an entry to edit.", "Chọn một mục để sửa."))}</p>
      <select onChange={(e) => setEditId(e.target.value)} defaultValue="" className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.9rem]"><option value="" disabled>{tr(t("Choose…", "Chọn…"))}</option>{entries.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
    </div>
  );
  return <EntryEditor entry={entry} />;
}

function EntryEditor({ entry }: { entry: PortfolioEntry }) {
  const { tr } = useLang();
  const [addType, setAddType] = useState<ProfileBlock["type"]>("overview");
  const blocks = [...entry.blocks].sort((a, b) => a.order - b.order);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-border bg-surface p-4">
        <div><div className="font-medium text-text">{entry.name}</div><div className="mono text-[0.68rem] text-text-2">/portfolio/{entry.slug} · <StatusBadge status={entry.status} inline /></div></div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/portfolio/${entry.slug}`} target="_blank" className={buttonClass("ghost", "sm")}>{tr(t("Preview", "Xem"))}</Link>
          <button onClick={() => saveVersion(entry, "Manual snapshot")} className={buttonClass("outline", "sm")}>{tr(t("Save version", "Lưu phiên bản"))}</button>
          {entry.status === "published" ? <button onClick={() => setEntryStatus(entry, "draft")} className={buttonClass("outline", "sm")}>{tr(t("Unpublish", "Hủy xuất bản"))}</button> : <button onClick={() => setEntryStatus(entry, "published")} className={buttonClass("primary", "sm")}>{tr(t("Publish", "Xuất bản"))}</button>}
        </div>
      </div>
      <div className="space-y-3">{blocks.map((b, i) => <BlockEditor key={b.id} entry={entry} block={b} first={i === 0} last={i === blocks.length - 1} />)}</div>
      <div className="mt-5 flex items-center gap-2 border border-dashed border-border p-4">
        <select value={addType} onChange={(e) => setAddType(e.target.value as ProfileBlock["type"])} className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem]">{ALL_BLOCKS.map((bt) => <option key={bt} value={bt}>{tr(blockTypeLabels[bt])}</option>)}</select>
        <button onClick={() => addBlock(entry, addType)} className={buttonClass("outline", "sm")}><Icon name="check" size={14} />{tr(t("Add block", "Thêm khối"))}</button>
      </div>
    </div>
  );
}

function BlockEditor({ entry, block, first, last }: { entry: PortfolioEntry; block: ContentBlock; first: boolean; last: boolean }) {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => JSON.stringify(block.data, null, 2));
  const [err, setErr] = useState("");
  function apply() {
    try { updateBlockData(entry, block.id, JSON.parse(draft) as ProfileBlock["data"]); setErr(""); setOpen(false); }
    catch { setErr(tr(t("Invalid JSON", "JSON không hợp lệ"))); }
  }
  return (
    <div className="border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="flex items-center gap-2">
          <span className="mono text-[0.68rem] text-text-2">{String(block.order).padStart(2, "0")}</span>
          <span className="font-medium text-text">{tr(blockTypeLabels[block.type])}</span>
          <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider", block.source === "ai" ? "bg-accent/15 text-accent" : "bg-border text-text-2")}>{block.source}</span>
          {block.status === "draft" && <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 text-[0.6rem] uppercase text-warn">draft</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => moveBlock(entry, block.id, -1)} disabled={first} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 disabled:opacity-30 hover:text-text">↑</button>
          <button onClick={() => moveBlock(entry, block.id, 1)} disabled={last} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 disabled:opacity-30 hover:text-text">↓</button>
          <button onClick={() => setBlockStatus(entry, block.id, block.status === "published" ? "draft" : "published")} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 hover:text-text">{block.status === "published" ? tr(t("Hide", "Ẩn")) : tr(t("Show", "Hiện"))}</button>
          <button onClick={() => { setDraft(JSON.stringify(block.data, null, 2)); setOpen((o) => !o); }} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-text-2 hover:text-text">{open ? tr(t("Close", "Đóng")) : tr(t("Edit", "Sửa"))}</button>
          <button onClick={() => removeBlock(entry, block.id)} className="rounded-[var(--radius-md)] border border-border px-2 py-1 text-[0.78rem] text-err hover:bg-err/10">✕</button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border p-3">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={9} className="mono w-full rounded-[var(--radius-md)] border border-border bg-bg p-3 text-[0.74rem] text-text outline-none focus:border-border-strong" spellCheck={false} />
          {err && <div className="mt-1 text-[0.8rem] text-err">{err}</div>}
          <div className="mt-2 flex justify-end gap-2"><button onClick={() => { setDraft(JSON.stringify(block.data, null, 2)); setErr(""); }} className={buttonClass("ghost", "sm")}>{tr(t("Reset", "Đặt lại"))}</button><button onClick={apply} className={buttonClass("primary", "sm")}>{tr(t("Apply", "Áp dụng"))}</button></div>
        </div>
      )}
    </div>
  );
}

function ReviewTab({ entries }: { entries: PortfolioEntry[] }) {
  const { tr } = useLang();
  const suggestions = useSuggestions();
  if (suggestions.length === 0) return <Empty text={tr(t("No suggestions. Use “Create with AI” or run AI on an entry.", "Chưa có đề xuất. Dùng “Tạo bằng AI” hoặc chạy AI."))} />;
  return (
    <div className="space-y-3">
      {suggestions.map((s) => {
        const target = entries.find((e) => e.id === s.entryId);
        const title = s.type === "new_profile" ? (s.proposedData as { meta?: { name?: string } })?.meta?.name ?? "New entry" : target ? target.name : s.slug;
        return (
          <div key={s.id} className="border border-border bg-surface p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2"><span className="mono rounded-[var(--radius-md)] bg-accent/15 px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider text-accent">ai</span><span className="mono text-[0.68rem] uppercase tracking-wider text-text-2">{s.type}</span><span className="text-[0.88rem] text-text">{title}</span></div>
            <p className="mb-2 text-[0.9rem] text-text-2"><span className="label mr-1 text-accent">{tr(t("Rationale", "Lý do"))}</span>{s.rationale}</p>
            <pre className="mono max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-[var(--radius-md)] border border-ok/40 bg-ok/5 p-3 text-[0.72rem] text-text">{JSON.stringify(s.proposedData, null, 2)}</pre>
            {s.status === "pending" ? (
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => rejectSuggestion(s.id, "Rejected")} className={buttonClass("outline", "sm")}><Icon name="x" size={14} />{tr(t("Reject", "Từ chối"))}</button>
                <button onClick={() => approveSuggestion(s.id, target)} className={buttonClass("primary", "sm")}><Icon name="check" size={14} />{tr(t("Approve", "Duyệt"))}</button>
              </div>
            ) : <div className="mt-2 mono text-[0.7rem] uppercase tracking-wider text-text-2">{s.status}{s.reviewNote ? ` · ${s.reviewNote}` : ""}</div>}
          </div>
        );
      })}
    </div>
  );
}

function VersionsTab({ entries }: { entries: PortfolioEntry[] }) {
  const { tr } = useLang();
  const versions = useVersions();
  if (versions.length === 0) return <Empty text={tr(t("No versions yet.", "Chưa có phiên bản."))} />;
  return (
    <div className="space-y-2">
      {versions.map((v) => {
        const e = entries.find((x) => x.id === v.entryId);
        return (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 border border-border bg-surface p-3">
            <div><div className="text-[0.9rem] text-text">{e ? e.name : v.entryId} · <span className="text-text-2">{v.note}</span></div><div className="mono text-[0.66rem] text-text-2">{new Date(v.createdAt).toLocaleString()} · {v.snapshot.length} blocks</div></div>
            {e && <button onClick={() => rollback(e, v.id)} className={buttonClass("outline", "sm")}>{tr(t("Rollback", "Khôi phục"))}</button>}
          </div>
        );
      })}
    </div>
  );
}

function Empty({ text }: { text: string }) { return <div className="border border-border bg-surface p-8 text-center text-[0.92rem] text-text-2">{text}</div>; }
function StatusBadge({ status, inline }: { status: "draft" | "published" | "archived"; inline?: boolean }) {
  const { tr } = useLang();
  const map = { published: ["bg-ok/15 text-ok", t("Published", "Đã xuất bản")], draft: ["bg-warn/20 text-warn", t("Draft", "Bản nháp")], archived: ["bg-border text-text-2", t("Archived", "Lưu trữ")] } as const;
  const [cls, label] = map[status];
  return <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider", cls, inline && "inline")}>{tr(label)}</span>;
}
