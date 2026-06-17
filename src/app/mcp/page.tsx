"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ServerCard } from "@/components/mcp/ServerCard";
import { InstallModal } from "@/components/mcp/InstallModal";
import { fetchServers } from "@/lib/mcp-client";
import type { ServerJson } from "@/lib/mcp-registry";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const LIMIT = 12;

export default function McpRegistry() {
  const { tr } = useLang();
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const [servers, setServers] = useState<ServerJson[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [history, setHistory] = useState<(string | undefined)[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [install, setInstall] = useState<ServerJson | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchServers({ limit: LIMIT, cursor, search: applied || undefined })
      .then((r) => { if (!cancelled) { setServers(r.servers); setCount(r.metadata.count); setNextCursor(r.metadata.next_cursor); } })
      .catch(() => { if (!cancelled) { setServers([]); setCount(0); setNextCursor(undefined); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [cursor, applied]);

  function search() { setApplied(q.trim()); setCursor(undefined); setHistory([]); }
  function next() { if (nextCursor) { setHistory((h) => [...h, cursor]); setCursor(nextCursor); } }
  function prev() { setHistory((h) => { const c = [...h]; const p = c.pop(); setCursor(p); return c; }); }

  return (
    <>
      {/* hero */}
      <section className="border-b border-border bg-bg">
        <div className="mx-auto max-w-[1180px] px-5 py-16 text-center sm:px-8 sm:py-20">
          <span className="accent-rule mx-auto mb-4 text-accent" />
          <h1 className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2rem,4.6vw,3.2rem)] font-medium leading-[1.06] text-text">
            {tr(t("Connect models to the real world", "Kết nối model với thế giới thực"))}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[1.05rem] text-text-2">
            {tr(t("Servers and tools that connect models to files, APIs, databases, and more.", "Server và công cụ kết nối model với tệp, API, cơ sở dữ liệu và hơn thế."))}
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
              <Icon name="search" size={16} className="text-text-2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") search(); }}
                placeholder={tr(t("Search servers…", "Tìm server…"))}
                className="w-full bg-transparent py-3 text-[0.95rem] text-text outline-none placeholder:text-text-2"
              />
            </div>
            <button onClick={search} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.9rem] font-medium text-white transition-colors hover:bg-fund">
              {tr(t("Search", "Tìm"))}
            </button>
          </div>
        </div>
      </section>

      {/* grid */}
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">
            {applied ? tr(t("Results", "Kết quả")) : tr(t("All MCP servers", "Tất cả MCP server"))}
          </h2>
          <span className="mono text-[0.95rem] text-text-2">{count}</span>
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-[var(--radius-lg)] border border-border bg-surface py-20 text-[0.9rem] text-text-2">{tr(t("Loading…", "Đang tải…"))}</div>
        ) : servers.length === 0 ? (
          <div className="grid place-items-center rounded-[var(--radius-lg)] border border-border bg-surface py-20 text-[0.9rem] text-text-2">{tr(t("No servers found.", "Không tìm thấy server."))}</div>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {servers.map((s) => <ServerCard key={s.name} server={s} onInstall={setInstall} />)}
          </div>
        )}

        {/* pagination */}
        {(history.length > 0 || nextCursor) && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button onClick={prev} disabled={history.length === 0} className={cn("rounded-[var(--radius-md)] border border-border px-4 py-2 text-[0.85rem]", history.length === 0 ? "cursor-not-allowed text-text-2/50" : "text-text hover:border-text")}>← {tr(t("Previous", "Trước"))}</button>
            <span className="mono px-3 text-[0.82rem] text-text-2">{tr(t("Page", "Trang"))} {history.length + 1}</span>
            <button onClick={next} disabled={!nextCursor} className={cn("rounded-[var(--radius-md)] border border-border px-4 py-2 text-[0.85rem]", !nextCursor ? "cursor-not-allowed text-text-2/50" : "text-text hover:border-text")}>{tr(t("Next", "Sau"))} →</button>
          </div>
        )}
      </div>

      <InstallModal server={install} onClose={() => setInstall(null)} />
    </>
  );
}
