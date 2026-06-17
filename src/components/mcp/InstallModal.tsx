"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { shortNameOf, type ServerJson, type EnvVar } from "@/lib/mcp-registry";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

type Client = "claude" | "raione" | "raw";

function buildSnippet(server: ServerJson, client: Client): string {
  const key = shortNameOf(server.name).replace(/[^a-z0-9-]/gi, "-") || server.name;
  const pkg = server.packages?.[0];
  const remote = server.remotes?.[0];

  if (client === "raw") return JSON.stringify(server, null, 2);

  let entry: Record<string, unknown>;
  if (pkg && pkg.transport.type === "stdio") {
    const cmd = pkg.registryType === "npm" ? "npx" : pkg.registryType === "pypi" ? "uvx" : "docker";
    const args = pkg.registryType === "npm" ? ["-y", pkg.identifier] : [pkg.identifier];
    const env: Record<string, string> = {};
    (pkg.environmentVariables ?? []).forEach((e) => { env[e.name] = e.isSecret ? "<điền-bí-mật>" : "<điền>"; });
    entry = { command: cmd, args, ...(Object.keys(env).length ? { env } : {}) };
  } else if (remote) {
    entry = { type: remote.type, url: remote.url };
  } else {
    entry = { command: "npx", args: ["-y", pkg?.identifier ?? server.name] };
  }

  if (client === "raione") {
    return JSON.stringify({ connector: { name: key, ...entry } }, null, 2);
  }
  return JSON.stringify({ mcpServers: { [key]: entry } }, null, 2);
}

export function InstallModal({ server, onClose }: { server: ServerJson | null; onClose: () => void }) {
  const { tr } = useLang();
  const [client, setClient] = useState<Client>("claude");
  const [copied, setCopied] = useState(false);
  if (!server) return null;

  const snippet = buildSnippet(server, client);
  const envVars: EnvVar[] = [
    ...(server.packages?.flatMap((p) => p.environmentVariables ?? []) ?? []),
    ...(server.remotes?.flatMap((r) => r.headers ?? []) ?? []),
  ];

  function copy() {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const tabs: { id: Client; label: string }[] = [
    { id: "claude", label: "Claude Code / Desktop" },
    { id: "raione", label: "RAI ONE" },
    { id: "raw", label: "server.json" },
  ];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-text/35 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <span className="label text-text-2">{tr(t("Install", "Cài đặt"))}</span>
            <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-medium text-text">{server.title}</h3>
          </div>
          <button onClick={onClose} className="text-text-2 hover:text-text"><Icon name="x" size={18} /></button>
        </div>

        <div className="mt-4 flex gap-1 rounded-[var(--radius-md)] border border-border bg-bg p-1">
          {tabs.map((tb) => (
            <button key={tb.id} onClick={() => setClient(tb.id)} className={cn("flex-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-[0.78rem] transition-colors", client === tb.id ? "bg-surface text-text" : "text-text-2 hover:text-text")}>
              {tb.label}
            </button>
          ))}
        </div>

        <div className="relative mt-3">
          <pre className="mono max-h-64 overflow-auto rounded-[var(--radius-md)] border border-border bg-bg p-4 text-[0.76rem] leading-relaxed text-text">{snippet}</pre>
          <button onClick={copy} className="absolute right-2 top-2 rounded-[var(--radius-sm)] bg-accent px-2.5 py-1 text-[0.72rem] font-medium text-white">
            {copied ? tr(t("Copied", "Đã copy")) : tr(t("Copy", "Sao chép"))}
          </button>
        </div>

        {envVars.length > 0 && (
          <div className="mt-4">
            <span className="label text-text-2">{tr(t("Required configuration", "Cấu hình cần điền"))}</span>
            <ul className="mt-2 grid gap-1.5">
              {envVars.map((e) => (
                <li key={e.name} className="flex items-center gap-2 text-[0.82rem]">
                  <span className="mono text-text">{e.name}</span>
                  {e.isRequired && <span className="mono rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.6rem] uppercase" style={{ color: "var(--color-err)", background: "color-mix(in srgb, var(--color-err) 12%, transparent)" }}>required</span>}
                  {e.isSecret && <span className="mono rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.6rem] uppercase" style={{ color: "var(--color-warn)", background: "color-mix(in srgb, var(--color-warn) 12%, transparent)" }}>secret</span>}
                  <span className="truncate text-text-2">{e.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {client === "raione" && (
          <button className="mt-4 w-full rounded-[var(--radius-md)] bg-accent py-2.5 text-[0.88rem] font-medium text-white">
            {tr(t("Connect to RAI ONE", "Kết nối vào RAI ONE"))}
          </button>
        )}
      </div>
    </div>
  );
}
