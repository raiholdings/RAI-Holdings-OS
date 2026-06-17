"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { InstallModal } from "@/components/mcp/InstallModal";
import { fetchServer, registryMeta, registryStats, versionsOf, colorForSource, initials } from "@/lib/mcp-client";
import { namespaceOf, type ServerJson, type EnvVar } from "@/lib/mcp-registry";
import { useLang, t } from "@/lib/i18n";

export default function ServerDetail() {
  const { tr } = useLang();
  const params = useParams<{ namespace: string; name: string }>();
  const fullName = `${params.namespace}/${params.name}`;
  const [server, setServer] = useState<ServerJson | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [install, setInstall] = useState<ServerJson | null>(null);

  useEffect(() => {
    let off = false;
    fetchServer(fullName)
      .then((s) => { if (!off) { setServer(s); setState("ok"); } })
      .catch(() => { if (!off) setState("missing"); });
    return () => { off = true; };
  }, [fullName]);

  if (state === "loading") return <Wrap><p className="py-20 text-center text-text-2">{tr(t("Loading…", "Đang tải…"))}</p></Wrap>;
  if (state === "missing" || !server) return <Wrap><p className="py-20 text-center text-text-2">{tr(t("Server not found.", "Không tìm thấy server."))} <Link href="/mcp" className="font-medium text-accent">← {tr(t("Registry", "Registry"))}</Link></p></Wrap>;

  const meta = registryMeta(server);
  const stats = registryStats(server);
  const versions = versionsOf(server);
  const color = colorForSource(meta.source);

  return (
    <Wrap>
      <Link href="/mcp" className="mono text-[0.74rem] text-text-2 transition-colors hover:text-text">← {tr(t("Registry", "Registry"))}</Link>

      <header className="mt-4 flex flex-wrap items-start gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8" style={{ borderTopColor: color, borderTopWidth: 3 }}>
        <span className="grid size-16 flex-none place-items-center rounded-[var(--radius-lg)] font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-white" style={{ background: color }}>{initials(server.title)}</span>
        <div className="min-w-0 flex-1">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-medium text-text">{server.title}</h1>
          <p className="mono mt-0.5 text-[0.78rem] text-text-2">{server.name} · v{server.version}</p>
          <p className="mt-2 text-[0.98rem] text-text-2">{server.description}</p>
          <div className="mono mt-3 flex flex-wrap gap-3 text-[0.72rem] text-text-2">
            <span>By {namespaceOf(server.name)}</span>
            <span className="flex items-center gap-1"><Icon name="bolt" size={12} /> {(stats.installs ?? 0).toLocaleString("en-US")}</span>
            {server.repository && <a href={server.repository.url} className="flex items-center gap-1 text-accent" target="_blank" rel="noreferrer"><Icon name="arrow-up-right" size={12} /> {tr(t("Repository", "Mã nguồn"))}</a>}
            {server.websiteUrl && <a href={server.websiteUrl} className="flex items-center gap-1 text-accent" target="_blank" rel="noreferrer"><Icon name="world" size={12} /> {tr(t("Website", "Website"))}</a>}
          </div>
        </div>
        <button onClick={() => setInstall(server)} className="flex-none rounded-[var(--radius-md)] px-5 py-2.5 text-[0.88rem] font-medium text-white" style={{ background: color }}>{tr(t("Install", "Cài đặt"))}</button>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-6">
          {(server.packages ?? []).length > 0 && (
            <Section title={tr(t("Packages", "Gói cài đặt"))}>
              {server.packages!.map((p, i) => (
                <div key={i} className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
                  <div className="flex items-center gap-2">
                    <span className="mono rounded-[var(--radius-sm)] bg-surface px-2 py-0.5 text-[0.68rem] uppercase text-text-2">{p.registryType}</span>
                    <span className="mono text-[0.84rem] text-text">{p.identifier}</span>
                    <span className="mono text-[0.72rem] text-text-2">v{p.version}</span>
                    <span className="mono ml-auto rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem]" style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}>{p.transport.type}</span>
                  </div>
                  <EnvList vars={p.environmentVariables} tr={tr} />
                </div>
              ))}
            </Section>
          )}

          {(server.remotes ?? []).length > 0 && (
            <Section title={tr(t("Remotes", "Remote"))}>
              {server.remotes!.map((r, i) => (
                <div key={i} className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
                  <div className="flex items-center gap-2">
                    <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem]" style={{ color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}>{r.type}</span>
                    <span className="mono truncate text-[0.82rem] text-text">{r.url}</span>
                  </div>
                  <EnvList vars={r.headers} tr={tr} />
                </div>
              ))}
            </Section>
          )}
        </div>

        <aside className="grid content-start gap-6">
          <Section title={tr(t("Install", "Cài đặt"))}>
            <button onClick={() => setInstall(server)} className="w-full rounded-[var(--radius-md)] bg-accent py-2.5 text-[0.88rem] font-medium text-white">{tr(t("Get config snippet", "Lấy snippet cấu hình"))}</button>
            <p className="mt-2 text-[0.78rem] text-text-2">{tr(t("Generates config for Claude Code / Desktop or RAI ONE.", "Sinh cấu hình cho Claude Code / Desktop hoặc RAI ONE."))}</p>
          </Section>
          <Section title={tr(t("Versions", "Phiên bản"))}>
            <ul className="mono grid gap-1.5 text-[0.8rem]">
              {(versions.length ? versions : [server.version]).map((v, i) => (
                <li key={v} className="flex items-center justify-between">
                  <span className="text-text">v{v}</span>
                  {i === 0 && <span className="rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.6rem] uppercase" style={{ color: "var(--color-ok)", background: "color-mix(in srgb, var(--color-ok) 12%, transparent)" }}>latest</span>}
                </li>
              ))}
            </ul>
          </Section>
        </aside>
      </div>

      <InstallModal server={install} onClose={() => setInstall(null)} />
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">{children}</main>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <span className="label text-text-2">{title}</span>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}
function EnvList({ vars, tr }: { vars?: EnvVar[]; tr: (s: { en: string; vi: string }) => string }) {
  if (!vars || vars.length === 0) return null;
  return (
    <ul className="mt-3 grid gap-1.5 border-t border-border pt-3">
      {vars.map((e) => (
        <li key={e.name} className="flex flex-wrap items-center gap-2 text-[0.8rem]">
          <span className="mono text-text">{e.name}</span>
          {e.isRequired && <span className="mono rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.58rem] uppercase" style={{ color: "var(--color-err)", background: "color-mix(in srgb, var(--color-err) 12%, transparent)" }}>required</span>}
          {e.isSecret && <span className="mono rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.58rem] uppercase" style={{ color: "var(--color-warn)", background: "color-mix(in srgb, var(--color-warn) 12%, transparent)" }}>secret</span>}
          <span className="truncate text-text-2">{e.description}</span>
        </li>
      ))}
    </ul>
  );
}
