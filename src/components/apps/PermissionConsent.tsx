"use client";

import { Icon } from "@/components/ui/Icon";
import type { RaiApp } from "@/lib/apps";
import { connectApp } from "@/lib/apps-store";
import { logAudit } from "./auditLog";
import { useLang, t } from "@/lib/i18n";

/**
 * OAuth 2.1-style authorization / consent screen (SEP-1865 §5.7).
 * Lists the scopes an app requests before connecting; on approval issues a
 * scoped token (mock) and records the connection. This mirrors an
 * authorization_code + PKCE consent step.
 */
export function PermissionConsent({ app, onClose }: { app: RaiApp | null; onClose: (connected: boolean) => void }) {
  const { tr } = useLang();
  if (!app) return null;

  function approve() {
    if (!app) return;
    const scopes = app.scopes.map((s) => s.id);
    connectApp(app.id, scopes);
    logAudit({ app: app.id, dir: "host→ui", kind: "consent", detail: `connected · granted ${scopes.join(", ")}` });
    onClose(true);
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-text/35 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: app.color, background: `color-mix(in srgb, ${app.color} 12%, transparent)` }}>
            <Icon name={app.icon} size={24} />
          </span>
          <div>
            <span className="label text-text-2">{tr(t("Authorize app", "Ủy quyền ứng dụng"))}</span>
            <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-medium text-text">{app.name}</h3>
          </div>
        </div>

        <p className="mt-4 text-[0.88rem] text-text-2">
          {tr(t("This app is requesting the following permissions. It will only receive a token for the scopes you approve.", "Ứng dụng này yêu cầu các quyền sau. Nó chỉ nhận token theo đúng scope bạn chấp thuận."))}
        </p>

        <ul className="mt-4 grid gap-2.5 rounded-[var(--radius-md)] border border-border bg-bg p-4">
          {app.scopes.map((s) => (
            <li key={s.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-none" style={{ color: app.color }}><Icon name="check" size={16} /></span>
              <span>
                <span className="block text-[0.88rem] text-text">{tr(s.label)}</span>
                <span className="mono block text-[0.68rem] text-text-2">{s.id}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mono mt-3 text-[0.68rem] text-text-2">OAuth 2.1 · authorization_code + PKCE · {app.mcpEndpoint}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => onClose(false)} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.85rem] text-text transition-colors hover:border-text">
            {tr(t("Cancel", "Hủy"))}
          </button>
          <button onClick={approve} className="rounded-[var(--radius-md)] px-4 py-2 text-[0.85rem] font-medium text-white" style={{ background: app.color }}>
            {tr(t("Allow & connect", "Cho phép & kết nối"))}
          </button>
        </div>
      </div>
    </div>
  );
}
