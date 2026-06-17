"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import {
  publishServer,
  runSync,
  fetchPending,
  moderate,
  initials,
  type SyncResult,
  type PendingImport,
} from "@/lib/mcp-client";
import { namespaceOf, type ServerJson } from "@/lib/mcp-registry";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
type Tab = "publish" | "sync";
type Transport = "npm-stdio" | "remote-sse" | "remote-streamable-http";

export default function AdminMcp() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("publish");

  const tabs: { id: Tab; label: ReturnType<typeof t> }[] = [
    { id: "publish", label: t("Publish", "Xuất bản") },
    { id: "sync", label: t("Sync & moderate", "Đồng bộ & duyệt") },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · MCP", "Quản trị · MCP"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("MCP servers", "MCP servers"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors",
              tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text",
            )}
          >
            {tr(tb.label)}
          </button>
        ))}
      </nav>
      {tab === "publish" && <PublishTab />}
      {tab === "sync" && <SyncTab />}
    </main>
  );
}

/* ----------------------------- Publish tab ------------------------------ */
function PublishTab() {
  const { tr } = useLang();
  const [f, setF] = useState({
    name: "vn.rai/", title: "", description: "", version: "1.0.0", repoUrl: "", websiteUrl: "",
    transport: "npm-stdio" as Transport, identifier: "@rai/", remoteUrl: "https://mcp.raiholdings.vn/",
    envName: "", envDesc: "", envRequired: true, envSecret: true, token: "rai_",
  });
  const [result, setResult] = useState<{ ok: boolean; id?: string; errors?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const server = useMemo<ServerJson>(() => {
    const env = f.envName ? [{ name: f.envName, description: f.envDesc || undefined, isRequired: f.envRequired, isSecret: f.envSecret }] : undefined;
    return {
      name: f.name, title: f.title, description: f.description, version: f.version,
      ...(f.websiteUrl ? { websiteUrl: f.websiteUrl } : {}),
      ...(f.repoUrl ? { repository: { url: f.repoUrl, source: "github" } } : {}),
      ...(f.transport === "npm-stdio"
        ? { packages: [{ registryType: "npm" as const, registryBaseUrl: "https://registry.npmjs.org", identifier: f.identifier, version: f.version, transport: { type: "stdio" as const }, ...(env ? { environmentVariables: env } : {}) }] }
        : { remotes: [{ type: f.transport === "remote-sse" ? ("sse" as const) : ("streamable-http" as const), url: f.remoteUrl }] }),
    };
  }, [f]);

  const ns = namespaceOf(f.name);
  const tokenHint = ns === "vn.rai" ? "rai_… (RAI OAuth + DNS TXT Ed25519)" : ns.startsWith("io.github.") ? "ghp_… (GitHub)" : tr(t("unsupported namespace", "namespace không hỗ trợ"));

  async function submit() {
    setBusy(true);
    const r = await publishServer(server, f.token);
    setResult(r);
    setBusy(false);
  }

  if (result?.ok) {
    const [namespace, ...rest] = server.name.split("/");
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--color-ok) 14%, transparent)", color: "var(--color-ok)" }}><Icon name="check" size={24} /></span>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-[1.3rem] font-medium text-text">{tr(t("Published", "Đã xuất bản"))}</h2>
        <p className="mono mt-2 text-[0.78rem] text-text-2">{result.id} · {server.name}@{server.version}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`/mcp/${namespace}/${rest.join("/")}`} target="_blank" className={buttonClass("primary", "sm")}>{tr(t("View server", "Xem server"))}</Link>
          <button onClick={() => setResult(null)} className={buttonClass("outline", "sm")}>{tr(t("Publish another", "Xuất bản tiếp"))}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-[0.95rem] text-text-2">{tr(t("Register a server.json. vn.rai/* requires a RAI token + verified DNS TXT; io.github.* requires GitHub. The registry stores metadata only.", "Đăng ký server.json. vn.rai/* cần token RAI + DNS TXT đã xác minh; io.github.* cần GitHub. Registry chỉ lưu metadata."))}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label={tr(t("Name (namespace/short)", "Tên (namespace/ngắn)"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label={tr(t("Version", "Phiên bản"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} /></Field>
          </div>
          <Field label={tr(t("Title", "Tiêu đề"))}><input className={inp} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label={tr(t("Description", "Mô tả"))}><textarea className={cn(inp, "min-h-[70px]")} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={tr(t("Repository URL", "URL mã nguồn"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.repoUrl} onChange={(e) => setF({ ...f, repoUrl: e.target.value })} /></Field>
            <Field label={tr(t("Website URL", "Website"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.websiteUrl} onChange={(e) => setF({ ...f, websiteUrl: e.target.value })} /></Field>
          </div>
          <Field label={tr(t("Transport", "Transport"))}>
            <select className={inp} value={f.transport} onChange={(e) => setF({ ...f, transport: e.target.value as Transport })}>
              <option value="npm-stdio">npm · stdio</option>
              <option value="remote-sse">remote · sse</option>
              <option value="remote-streamable-http">remote · streamable-http</option>
            </select>
          </Field>
          {f.transport === "npm-stdio" ? (
            <Field label={tr(t("npm package identifier", "Định danh package npm"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} /></Field>
          ) : (
            <Field label={tr(t("Remote URL", "URL remote"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.remoteUrl} onChange={(e) => setF({ ...f, remoteUrl: e.target.value })} /></Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label={tr(t("Env var name (optional)", "Tên biến env (tuỳ chọn)"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.envName} onChange={(e) => setF({ ...f, envName: e.target.value })} placeholder="RAI_API_KEY" /></Field>
            <Field label={tr(t("Env description", "Mô tả biến"))}><input className={inp} value={f.envDesc} onChange={(e) => setF({ ...f, envDesc: e.target.value })} /></Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[0.84rem] text-text"><input type="checkbox" checked={f.envRequired} onChange={(e) => setF({ ...f, envRequired: e.target.checked })} className="accent-[var(--color-accent)]" />{tr(t("required", "bắt buộc"))}</label>
            <label className="flex items-center gap-2 text-[0.84rem] text-text"><input type="checkbox" checked={f.envSecret} onChange={(e) => setF({ ...f, envSecret: e.target.checked })} className="accent-[var(--color-accent)]" />{tr(t("secret", "bí mật"))}</label>
          </div>
          <Field label={tr(t("Auth token", "Token xác thực"))}>
            <input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.token} onChange={(e) => setF({ ...f, token: e.target.value })} />
            <span className="mono mt-1 text-[0.68rem] text-text-2">{tr(t("Expected:", "Cần:"))} {tokenHint}</span>
          </Field>

          {result?.errors && (
            <div className="rounded-[var(--radius-md)] border p-3" style={{ borderColor: "var(--color-err)", background: "color-mix(in srgb, var(--color-err) 8%, transparent)" }}>
              <span className="label" style={{ color: "var(--color-err)" }}>{tr(t("Rejected", "Bị từ chối"))}</span>
              <ul className="mono mt-1.5 grid gap-1 text-[0.74rem]" style={{ color: "var(--color-err)" }}>
                {result.errors.map((e, i) => <li key={i}>· {e}</li>)}
              </ul>
            </div>
          )}
          <button onClick={submit} disabled={busy} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.92rem] font-medium text-white transition-colors hover:bg-fund disabled:opacity-60">
            {busy ? tr(t("Publishing…", "Đang xuất bản…")) : tr(t("Publish to registry", "Xuất bản lên registry"))}
          </button>
        </div>

        {/* live server.json preview */}
        <aside>
          <span className="label text-text-2">server.json {tr(t("preview", "xem trước"))}</span>
          <pre className="mono mt-2 max-h-[560px] overflow-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-[0.72rem] leading-relaxed text-text">{JSON.stringify(server, null, 2)}</pre>
        </aside>
      </div>
    </div>
  );
}

/* ----------------------------- Sync & moderate tab ---------------------- */
function SyncTab() {
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
    <div>
      <div className="max-w-2xl">
        <p className="text-[0.95rem] text-text-2">{tr(t("Pull servers updated since a timestamp from registry.modelcontextprotocol.io. Imports are queued for manual review before going live (only vn.rai/* auto-publishes).", "Kéo server cập nhật sau một mốc thời gian từ registry.modelcontextprotocol.io. Bản import chờ duyệt tay trước khi lên (chỉ vn.rai/* tự xuất bản)."))}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
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

      <p className="mt-6 text-[0.82rem] text-text-2">{tr(t("Approved servers appear in the", "Server đã duyệt sẽ xuất hiện ở"))} <Link href="/mcp" target="_blank" className="font-medium text-accent">/mcp</Link> {tr(t("directory.", "."))}</p>
    </div>
  );
}

/* ----------------------------- shared bits ------------------------------ */
const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[0.78rem] font-medium text-text-2">{label}</span>{children}</label>;
}
function Badge({ children, tone = "var(--color-text-2)" }: { children: React.ReactNode; tone?: string }) {
  return <span className="mono rounded-[var(--radius-sm)] px-2.5 py-1 text-[0.74rem]" style={{ color: tone, background: `color-mix(in srgb, ${tone} 12%, transparent)` }}>{children}</span>;
}
