"use client";

import { useEffect, useRef } from "react";
import { getServer, type ToolResult } from "@/lib/apps-mcp";
import type { RaiApp } from "@/lib/apps";
import { recordUsage } from "@/lib/apps-store";
import { logAudit } from "./auditLog";

export type ConsentInfo = { appId: string; appName: string; color: string; tool: string; args: Record<string, unknown> };

/**
 * Host-side renderer for an app's pre-declared ui:// resource.
 * Renders the template in a strict sandboxed iframe (allow-scripts, NO
 * allow-same-origin) and bridges postMessage ↔ MCP JSON-RPC (SEP-1865 §3.2–3.3).
 */
export function McpAppFrame({
  app,
  initial,
  onRequestConsent,
  grantedScopes = [],
  textOnly = false,
}: {
  app: RaiApp;
  initial: { tool: string; result: ToolResult };
  onRequestConsent: (info: ConsentInfo) => Promise<boolean>;
  grantedScopes?: string[];
  textOnly?: boolean;
}) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const server = getServer(app.id);

  useEffect(() => {
    if (textOnly || !server) return;
    const iframe = ref.current;
    if (!iframe) return;

    function send(msg: unknown) {
      iframe?.contentWindow?.postMessage(msg, "*");
    }

    async function onMessage(e: MessageEvent) {
      if (e.source !== iframe?.contentWindow) return;
      const m = e.data;
      if (!m || m.jsonrpc !== "2.0") return;

      if (m.method === "ui/ready") {
        logAudit({ app: app.id, dir: "ui→host", kind: "ui/ready", detail: "widget ready" });
        send({ jsonrpc: "2.0", method: "ui/render", params: { tool: initial.tool, data: initial.result.structuredContent } });
        logAudit({ app: app.id, dir: "host→ui", kind: "ui/render", detail: initial.tool });
        return;
      }

      if (m.method === "tools/call" && m.id != null) {
        const { name, arguments: args = {} } = m.params || {};
        logAudit({ app: app.id, dir: "ui→host", kind: "tools/call", detail: `${name}(${JSON.stringify(args)})` });

        // OAuth scope enforcement (SEP-1865 §5.7): deny tool calls outside granted scopes.
        const required = app.tools.find((tool) => tool.name === name)?.scope;
        if (required && !grantedScopes.includes(required)) {
          send({ jsonrpc: "2.0", id: m.id, error: { code: -32002, message: `Insufficient scope: ${required}` } });
          logAudit({ app: app.id, dir: "host→ui", kind: "error", detail: `insufficient_scope ${required}` });
          return;
        }

        const ok = await onRequestConsent({ appId: app.id, appName: app.name, color: app.color, tool: name, args });
        logAudit({ app: app.id, dir: "host→ui", kind: "consent", detail: ok ? `approved ${name}` : `denied ${name}` });
        if (!ok) {
          send({ jsonrpc: "2.0", id: m.id, error: { code: -32001, message: "User denied the tool call" } });
          logAudit({ app: app.id, dir: "host→ui", kind: "error", detail: `denied ${name}` });
          return;
        }
        const result = server!.call(name, args);
        recordUsage(app.id, name);
        send({ jsonrpc: "2.0", id: m.id, result: { structuredContent: result.structuredContent, content: [{ type: "text", text: result.fallbackText }] } });
        logAudit({ app: app.id, dir: "host→ui", kind: "result", detail: name });
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [app, initial, onRequestConsent, server, textOnly, grantedScopes]);

  if (textOnly || !server) {
    // Backward-compatible fallback for text-only hosts (SEP-1865 §3.4).
    return (
      <pre className="mono whitespace-pre-wrap rounded-[var(--radius-md)] border border-border bg-bg p-4 text-[0.8rem] text-text-2">
        {initial.result.fallbackText}
      </pre>
    );
  }

  return (
    <iframe
      ref={ref}
      title={app.name}
      sandbox="allow-scripts"
      srcDoc={server.template}
      className="h-[340px] w-full rounded-[var(--radius-md)] border border-border bg-transparent"
    />
  );
}
