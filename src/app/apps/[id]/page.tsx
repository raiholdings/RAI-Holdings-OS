"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useDirectoryApps, useConnection, disconnectApp } from "@/lib/apps-store";
import { PermissionConsent } from "@/components/apps/PermissionConsent";
import { useLang, t } from "@/lib/i18n";

export default function AppDetail() {
  const { tr } = useLang();
  const params = useParams<{ id: string }>();
  const app = useDirectoryApps().find((a) => a.id === params.id);
  const connection = useConnection(params.id);
  const [consentOpen, setConsentOpen] = useState(false);

  if (!app) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-2">{tr(t("App not found.", "Không tìm thấy ứng dụng."))}</p>
        <Link href="/apps" className="mt-3 inline-block text-[0.9rem] font-medium text-accent">← {tr(t("Back to directory", "Về thư mục"))}</Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/apps" className="mono text-[0.74rem] text-text-2 transition-colors hover:text-text">← {tr(t("Directory", "Thư mục"))}</Link>

      {/* header */}
      <header className="mt-4 flex flex-wrap items-start gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8" style={{ borderTopColor: app.color, borderTopWidth: 3 }}>
        <span className="grid size-16 flex-none place-items-center rounded-[var(--radius-lg)]" style={{ color: app.color, background: `color-mix(in srgb, ${app.color} 12%, transparent)` }}>
          <Icon name={app.icon} size={32} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-medium text-text">{app.name}</h1>
            <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem] uppercase" style={{ color: app.color, background: `color-mix(in srgb, ${app.color} 10%, transparent)` }}>{tr(app.categoryLabel)}</span>
          </div>
          <p className="mt-1 text-[1rem] text-text-2">{tr(app.tagline)}</p>
          <div className="mono mt-2 text-[0.72rem] text-text-2">{tr(t("By", "Bởi"))} {app.developer} · {app.mcpEndpoint}</div>
        </div>
        <div className="flex flex-none flex-col items-end gap-2">
          {connection ? (
            <>
              <Link href={`/apps/host?app=${app.id}`} className="rounded-[var(--radius-md)] px-4 py-2.5 text-[0.88rem] font-medium text-white" style={{ background: app.color }}>
                {tr(t("Open in host", "Mở trong host"))}
              </Link>
              <button onClick={() => disconnectApp(app.id)} className="mono text-[0.72rem] text-text-2 hover:text-text">{tr(t("disconnect", "ngắt kết nối"))}</button>
            </>
          ) : (
            <button onClick={() => setConsentOpen(true)} className="rounded-[var(--radius-md)] px-4 py-2.5 text-[0.88rem] font-medium text-white" style={{ background: app.color }}>
              {tr(t("Connect", "Kết nối"))}
            </button>
          )}
          {connection && <span className="mono text-[0.66rem]" style={{ color: "var(--color-ok)" }}>✓ {connection.scopes.length} {tr(t("scopes granted", "scope đã cấp"))}</span>}
        </div>
      </header>

      <PermissionConsent app={consentOpen ? app : null} onClose={() => setConsentOpen(false)} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* left: description + preview */}
        <div className="grid gap-6">
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <span className="label text-text-2">{tr(t("About", "Giới thiệu"))}</span>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-text">{tr(app.description)}</p>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <span className="label text-text-2">{tr(t("Preview", "Xem trước"))}</span>
            <div className="mt-3 grid aspect-[16/9] place-items-center rounded-[var(--radius-md)] border border-dashed border-border" style={{ background: `color-mix(in srgb, ${app.color} 8%, transparent)` }}>
              <div className="text-center">
                <Icon name={app.icon} size={40} className="mx-auto" style={{ color: app.color }} />
                <Link href={`/apps/host?app=${app.id}`} className="mt-3 inline-block text-[0.85rem] font-medium" style={{ color: app.color }}>
                  {tr(t("Open in host playground →", "Mở trong host thử nghiệm →"))}
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <span className="label text-text-2">{tr(t("Tools", "Công cụ"))}</span>
            <div className="mt-3 grid gap-2">
              {app.tools.map((tool) => (
                <div key={tool.name} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                  <div className="mono text-[0.82rem] text-text">{tool.name}({tool.args.map((a) => a.name).join(", ")})</div>
                  <div className="mt-1 text-[0.82rem] text-text-2">{tr(tool.description)}</div>
                  {tool.uiResourceUri && <div className="mono mt-1 text-[0.68rem]" style={{ color: app.color }}>{tool.uiResourceUri}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* right: permissions + meta */}
        <aside className="grid content-start gap-6">
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <span className="label text-text-2">{tr(t("Permissions requested", "Quyền yêu cầu"))}</span>
            <ul className="mt-3 grid gap-2.5">
              {app.scopes.map((s) => (
                <li key={s.id} className="flex items-start gap-2 text-[0.86rem] text-text">
                  <span className="mt-0.5 flex-none text-text-2"><Icon name="check" size={15} /></span>
                  <span>{tr(s.label)} <span className="mono block text-[0.68rem] text-text-2">{s.id}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <span className="label text-text-2">{tr(t("UI resource", "UI resource"))}</span>
            <div className="mono mt-2 text-[0.8rem]" style={{ color: app.color }}>{app.uiResourceUri}</div>
            <div className="mono mt-1 text-[0.7rem] text-text-2">text/html+mcp · sandboxed iframe</div>
          </section>
        </aside>
      </div>
    </>
  );
}
