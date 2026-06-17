"use client";

import { useLang, t } from "@/lib/i18n";

export type ConsentRequest = {
  appId: string;
  appName: string;
  color: string;
  tool: string;
  args: Record<string, unknown>;
  resolve: (ok: boolean) => void;
};

/** User-consent dialog for tool calls initiated from a UI widget (SEP-1865 §3.3). */
export function Consent({ request }: { request: ConsentRequest | null }) {
  const { tr } = useLang();
  if (!request) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-text/30 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <span className="label text-text-2">{tr(t("Permission request", "Yêu cầu cấp quyền"))}</span>
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">
          <span style={{ color: request.color }}>{request.appName}</span> {tr(t("wants to run a tool", "muốn chạy một công cụ"))}
        </h3>
        <div className="mt-3 rounded-[var(--radius-md)] border border-border bg-bg p-3">
          <div className="mono text-[0.8rem] text-text">{request.tool}()</div>
          <div className="mono mt-1 text-[0.72rem] text-text-2">{JSON.stringify(request.args)}</div>
        </div>
        <p className="mt-3 text-[0.82rem] text-text-2">
          {tr(t("This action was initiated by the app's interface and is logged.", "Hành động này được khởi tạo từ giao diện ứng dụng và được ghi log."))}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => request.resolve(false)} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.85rem] text-text transition-colors hover:border-text">
            {tr(t("Deny", "Từ chối"))}
          </button>
          <button onClick={() => request.resolve(true)} className="rounded-[var(--radius-md)] px-4 py-2 text-[0.85rem] font-medium text-white" style={{ background: request.color }}>
            {tr(t("Approve", "Chấp thuận"))}
          </button>
        </div>
      </div>
    </div>
  );
}
