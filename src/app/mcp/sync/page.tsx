"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { runSync, fetchPending, moderate, initials, type SyncResult, type PendingImport } from "@/lib/mcp-client";
import { namespaceOf } from "@/lib/mcp-registry";
import { useLang, t } from "@/lib/i18n";

export default function McpSync() {
  const { tr } = useLang();
  const [since, setSince] = useState("2026-01-01T00:00:00Z");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [pending, setPending] = useState<PendingImport[]>([]);

  const refresh = () => fetchPending().then(setPending);
  useEffect(() => { refresh(); }, []);

  async function sync() {
    setBusy(true);
    const r = await runSync(since || undefined);
    setResult(r);
    await refresh();
    setBusy(false);
  }
  async function act(name: string, action: "approve" | "reject") {
    await moderate(name, action);
    await refresh();
  }

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Phase 5 · Upstream sync", "Phase 5 · Đồng bộ upstream"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("Sync from the official registry", "Đồng bộ từ registry chính thức"))}</h1>
        <p className="mt-3 text-[0.98rem] text-text-2">{tr(t("Pull servers updated since a timestamp from registry.modelcontextprotocol.io. Imports are queued for manual review before going live (only vn.rai/* auto-publishes).", "Kéo server cập nhật sau một mốc thời gian từ registry.modelcontextprotocol.io. Bản import chờ duyệt tay trước khi lên (chỉ vn.rai/* tự xuất bản).") )}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <label className="grid flex-1 gap-1.5">
          <span className="text-[0.78rem] font-medium text-text-2">updated_since (RFC3339)</span>
          <input value={since} onChange={(e) => setSince(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 font-[family-name:var(--font-mono)] text-[0.85rem] text-text outline-none focus:border-accent" />
        </label>
        <button onClick={sync} disabled={busy} className="rounded-[var(--radius-md)] bg-accent px-5 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-fund disabled:opacity-60">
          {busy ? tr(t("Syncing…", "Đang đồng bộ…")) : tr(t("Run sync", "Chạy đồng bộ"))}
        </button>
      </div>

      {result && (
        <div className="mt-3 flex flex-wrap gap-2 text-[0.82rem]">
          <Badge>{tr(t("fetched", "lấy về"))}: {result.fetched}</Badge>
          <Badge>{tr(t("imported", "nhập mới"))}: {result.imported}</Badge>
          <Badge tone={result.source === "live" ? "var(--color-ok)" : "var(--color-warn)"}>{tr(t("source", "nguồn"))}: {result.source === "live" ? tr(t("live upstream", "upstream thật")) : tr(t("fixture (offline)", "fixture (offline)"))}</Badge>
        </div>
      )}

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("Pending review", "Chờ duyệt"))}</h2>
        <span className="mono text-[0.9rem] text-text-2">{pending.length}</span>
      </div>

      {pending.length === 0 ? (
        <div className="mt-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">
          {tr(t("Nothing pending. Run a sync to import community servers.", "Không có gì chờ duyệt. Chạy đồng bộ để nhập server cộng đồng."))}
        </div>
      ) : (
        <div className="mt-3 grid gap-3">
          {pending.map((p) => (
            <div key={p.server.name} className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
              <span className="grid size-10 flex-none place-items-center rounded-[var(--radius-md)] font-[family-name:var(--font-display)] text-[0.8rem] font-medium text-white" style={{ background: "#2E75B6" }}>{initials(p.server.title)}</span>
              <div className="min-w-0 flex-1">
                <div className="font-[family-name:var(--font-display)] text-[0.98rem] font-medium text-text">{p.server.title}</div>
                <div className="mono text-[0.68rem] text-text-2">{p.server.name} · By {namespaceOf(p.server.name)}</div>
                <p className="mt-1 line-clamp-1 text-[0.82rem] text-text-2">{p.server.description}</p>
              </div>
              <div className="flex flex-none gap-2">
                <button onClick={() => act(p.server.name, "approve")} className="rounded-[var(--radius-md)] px-4 py-2 text-[0.84rem] font-medium text-white" style={{ background: "var(--color-ok)" }}>{tr(t("Approve", "Duyệt"))}</button>
                <button onClick={() => act(p.server.name, "reject")} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reject", "Từ chối"))}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-[0.82rem] text-text-2">{tr(t("Approved servers appear in the", "Server đã duyệt sẽ xuất hiện ở"))} <Link href="/mcp" className="font-medium text-accent">/mcp</Link> {tr(t("directory.", "."))}</p>
    </main>
  );
}

function Badge({ children, tone = "var(--color-text-2)" }: { children: React.ReactNode; tone?: string }) {
  return <span className="mono rounded-[var(--radius-sm)] px-2.5 py-1 text-[0.74rem]" style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>{children}</span>;
}
