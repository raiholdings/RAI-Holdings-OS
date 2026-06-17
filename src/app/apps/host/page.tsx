"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { apps, getApp, type RaiApp } from "@/lib/apps";
import { getServer, type ToolResult } from "@/lib/apps-mcp";
import { McpAppFrame, type ConsentInfo } from "@/components/apps/McpAppFrame";
import { Consent, type ConsentRequest } from "@/components/apps/Consent";
import { PermissionConsent } from "@/components/apps/PermissionConsent";
import { useAuditLog, clearAudit, logAudit } from "@/components/apps/auditLog";
import { useConnections, recordUsage, hydrateStore, isConnected, grantedScopes } from "@/lib/apps-store";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

type Launched = { key: number; app: RaiApp; tool: string; result: ToolResult; scopes: string[] };

export default function HostPlayground() {
  const { tr } = useLang();
  const connections = useConnections();
  const [thread, setThread] = useState<Launched[]>([]);
  const [pending, setPending] = useState<ConsentRequest | null>(null);
  const [connectApp_, setConnectApp_] = useState<RaiApp | null>(null);
  const [textOnly, setTextOnly] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mention, setMention] = useState("");
  const counter = useRef(0);

  const launch = useCallback((appId: string) => {
    const app = getApp(appId);
    if (!app) return;
    const server = getServer(appId);
    const scopes = grantedScopes(appId);
    let tool: string;
    let result: ToolResult;
    if (server) {
      tool = server.primaryTool;
      result = server.call(server.primaryTool, server.defaultArgs);
      recordUsage(appId, tool);
      logAudit({ app: appId, dir: "host→ui", kind: "tools/call", detail: `${tool} (launch)` });
    } else {
      tool = "(remote)";
      result = { structuredContent: {}, fallbackText: `Ứng dụng cộng đồng — kết nối tới MCP server thật tại ${app.mcpEndpoint}` };
    }
    counter.current += 1;
    setThread((prev) => [...prev, { key: counter.current, app, tool, result, scopes }]);
    setPickerOpen(false);
    setMention("");
  }, []);

  // deep-link: /apps/host?app=property → connect (if needed) then launch
  useEffect(() => {
    hydrateStore();
    const id = new URLSearchParams(window.location.search).get("app");
    if (!id) return;
    if (isConnected(id)) launch(id);
    else { const a = getApp(id); if (a) setConnectApp_(a); }
  }, [launch]);

  const onRequestConsent = useCallback((info: ConsentInfo) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...info, resolve: (ok) => { setPending(null); resolve(ok); } });
    });
  }, []);

  function pick(app: RaiApp) {
    if (isConnected(app.id)) launch(app.id);
    else { setConnectApp_(app); setPickerOpen(false); }
  }

  const filteredApps = apps.filter((a) => {
    const m = mention.replace("@", "").toLowerCase();
    return !m || a.name.toLowerCase().includes(m);
  });

  return (
    <>
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Host runtime · RAI ONE", "Host runtime · RAI ONE"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">
          {tr(t("Apps, running in the conversation", "Ứng dụng chạy trong hội thoại"))}
        </h1>
        <p className="mt-3 text-[0.98rem] text-text-2">
          {tr(t("Mention an app with @ to launch it. Unconnected apps ask for authorization first; tool calls are scope-checked, consented, metered, and logged.", "Gõ @ để gọi ứng dụng. Ứng dụng chưa kết nối sẽ xin ủy quyền trước; tool call được kiểm tra scope, xin chấp thuận, đo lường và ghi log."))}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex min-h-[520px] flex-col rounded-[var(--radius-lg)] border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="mono text-[0.72rem] text-text-2">CHAT // RAI ONE</span>
            <label className="flex cursor-pointer items-center gap-2 text-[0.78rem] text-text-2">
              <input type="checkbox" checked={textOnly} onChange={(e) => setTextOnly(e.target.checked)} className="accent-[var(--color-accent)]" />
              {tr(t("Text-only host", "Host chỉ-text"))}
            </label>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {thread.length === 0 && (
              <div className="grid h-full place-items-center text-center text-[0.88rem] text-text-2">
                <div><Icon name="message" size={28} className="mx-auto text-text-2" /><p className="mt-2">{tr(t("Mention an app below to start.", "Gõ @ bên dưới để bắt đầu."))}</p></div>
              </div>
            )}
            {thread.map((m) => (
              <div key={m.key} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-[var(--radius-sm)]" style={{ color: m.app.color, background: `color-mix(in srgb, ${m.app.color} 12%, transparent)` }}><Icon name={m.app.icon} size={15} /></span>
                  <span className="text-[0.86rem] font-medium text-text">{m.app.name}</span>
                  <span className="mono text-[0.68rem] text-text-2">{m.tool}()</span>
                </div>
                <McpAppFrame app={m.app} initial={{ tool: m.tool, result: m.result }} onRequestConsent={onRequestConsent} grantedScopes={m.scopes} textOnly={textOnly} />
              </div>
            ))}
          </div>

          <div className="relative border-t border-border p-3">
            {pickerOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
                {filteredApps.map((a) => (
                  <button key={a.id} onClick={() => pick(a)} className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-bg">
                    <span className="grid size-7 flex-none place-items-center rounded-[var(--radius-sm)]" style={{ color: a.color, background: `color-mix(in srgb, ${a.color} 12%, transparent)` }}><Icon name={a.icon} size={15} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.86rem] font-medium text-text">{a.name}</span>
                      <span className="block truncate text-[0.74rem] text-text-2">{tr(a.tagline)}</span>
                    </span>
                    {connections[a.id]
                      ? <span className="mono flex-none text-[0.66rem]" style={{ color: "var(--color-ok)" }}>● {tr(t("connected", "đã kết nối"))}</span>
                      : <span className="mono flex-none text-[0.66rem] text-text-2">{tr(t("connect", "kết nối"))}</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-bg px-3">
              <button onClick={() => setPickerOpen((v) => !v)} aria-label="@" className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-accent">@</button>
              <input
                value={mention}
                onChange={(e) => { setMention(e.target.value); setPickerOpen(e.target.value.includes("@")); }}
                onKeyDown={(e) => { if (e.key === "Enter" && filteredApps[0]) pick(filteredApps[0]); }}
                placeholder={tr(t("Type @ to mention an app…", "Gõ @ để gọi ứng dụng…"))}
                className="w-full bg-transparent py-2.5 text-[0.9rem] text-text outline-none placeholder:text-text-2"
              />
            </div>
          </div>
        </div>

        <AuditPanel />
      </div>

      <Consent request={pending} />
      <PermissionConsent app={connectApp_} onClose={(ok) => { const a = connectApp_; setConnectApp_(null); if (ok && a) launch(a.id); }} />
    </>
  );
}

function AuditPanel() {
  const { tr } = useLang();
  const log = useAuditLog();
  const colors: Record<string, string> = { "tools/call": "var(--color-holdings)", result: "var(--color-ok)", error: "var(--color-err)", consent: "var(--color-warn)", "ui/render": "var(--color-lab)", "ui/ready": "var(--color-text-2)" };
  return (
    <aside className="rounded-[var(--radius-lg)] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="mono text-[0.72rem] text-text-2">AUDIT LOG</span>
        <button onClick={clearAudit} className="mono text-[0.7rem] text-text-2 transition-colors hover:text-text">{tr(t("clear", "xóa"))}</button>
      </div>
      <div className="max-h-[460px] overflow-y-auto p-2">
        {log.length === 0 && <p className="p-4 text-center text-[0.8rem] text-text-2">{tr(t("No messages yet.", "Chưa có thông điệp."))}</p>}
        {log.map((e) => (
          <div key={e.seq} className="border-b border-border/60 px-2 py-2 last:border-0">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: colors[e.kind] || "var(--color-text-2)" }} />
              <span className="mono text-[0.68rem] text-text-2">{e.dir}</span>
              <span className="mono text-[0.68rem]" style={{ color: colors[e.kind] || "var(--color-text-2)" }}>{e.kind}</span>
              <span className="mono ml-auto text-[0.64rem] text-text-2">#{e.seq}</span>
            </div>
            <div className="mono mt-0.5 truncate text-[0.7rem] text-text">{e.app} · {e.detail}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
