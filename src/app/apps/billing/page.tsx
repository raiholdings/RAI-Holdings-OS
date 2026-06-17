"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getApp, type RaiApp } from "@/lib/apps";
import { useConnections, useUsage, useSubmissions, submissionToApp, setPlan, disconnectApp } from "@/lib/apps-store";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const PREMIUM_PRICE = 9; // $/mo per app — schema only, no real gateway
const DEV_SHARE = 0.7;

export default function Billing() {
  const { tr } = useLang();
  const connections = useConnections();
  const usage = useUsage();
  const subs = useSubmissions();

  const resolve = (id: string): RaiApp | undefined => getApp(id) ?? subs.filter((s) => s.status === "approved").map(submissionToApp).find((a) => a.id === id);
  const connected = Object.values(connections);
  const totalCalls = Object.values(usage).reduce((n, u) => n + u.total, 0);
  const premiumCount = connected.filter((c) => c.plan === "premium").length;
  const mrr = premiumCount * PREMIUM_PRICE;

  return (
    <>
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Phase 5 · Identity & billing", "Phase 5 · Danh tính & billing"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("Connections, usage & revenue share", "Kết nối, sử dụng & chia doanh thu"))}</h1>
        <p className="mt-3 text-[0.98rem] text-text-2">{tr(t("Apps you authorized via OAuth 2.1, their metered usage, plan, and the revenue-share schema with developers. (Schema only — no payment gateway.)", "Ứng dụng bạn đã ủy quyền qua OAuth 2.1, lượng dùng đo được, gói, và schema chia doanh thu với nhà phát triển. (Chỉ schema — chưa có cổng thanh toán.)"))}</p>
      </div>

      {/* summary */}
      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border lg:grid-cols-4">
        <Stat label={tr(t("Connected apps", "App đã kết nối"))} value={String(connected.length)} />
        <Stat label={tr(t("Tool calls (metered)", "Tool call (đo được)"))} value={String(totalCalls)} />
        <Stat label={tr(t("Premium apps", "App premium"))} value={String(premiumCount)} />
        <Stat label={tr(t("Est. MRR", "MRR ước tính"))} value={`$${mrr}`} />
      </div>

      {/* connections */}
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("Your connections", "Kết nối của bạn"))}</h2>
      {connected.length === 0 && (
        <div className="mt-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">
          {tr(t("No connected apps yet.", "Chưa kết nối ứng dụng nào."))} <Link href="/apps" className="font-medium text-accent">{tr(t("Browse the directory →", "Mở thư mục →"))}</Link>
        </div>
      )}
      <div className="mt-3 grid gap-3">
        {connected.map((c) => {
          const app = resolve(c.appId);
          const u = usage[c.appId];
          if (!app) return null;
          const price = c.plan === "premium" ? PREMIUM_PRICE : 0;
          return (
            <div key={c.appId} className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-10 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: app.color, background: `color-mix(in srgb, ${app.color} 12%, transparent)` }}><Icon name={app.icon} size={20} /></span>
                <div className="min-w-0 flex-1">
                  <div className="font-[family-name:var(--font-display)] text-[1rem] font-medium text-text">{app.name}</div>
                  <div className="mono text-[0.68rem] text-text-2">{c.scopes.join(" · ")}</div>
                </div>
                {/* plan toggle */}
                <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
                  {(["free", "premium"] as const).map((p) => (
                    <button key={p} onClick={() => setPlan(c.appId, p)} className={cn("px-3 py-1.5 uppercase transition-colors", c.plan === p ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{p}</button>
                  ))}
                </div>
                <button onClick={() => disconnectApp(c.appId)} className="mono text-[0.7rem] text-text-2 hover:text-text">{tr(t("disconnect", "ngắt"))}</button>
              </div>

              <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                <Mini label={tr(t("Tool calls", "Tool call"))} value={String(u?.total ?? 0)} />
                <Mini label={tr(t("Plan / mo", "Gói / tháng"))} value={`$${price}`} />
                <Mini label={tr(t("Dev / RAI split", "Chia Dev / RAI"))} value={`$${(price * DEV_SHARE).toFixed(1)} / $${(price * (1 - DEV_SHARE)).toFixed(1)}`} />
              </div>
              {u && Object.keys(u.byTool).length > 0 && (
                <div className="mono mt-3 flex flex-wrap gap-2 text-[0.7rem] text-text-2">
                  {Object.entries(u.byTool).map(([tool, n]) => (
                    <span key={tool} className="rounded-[var(--radius-sm)] border border-border bg-bg px-2 py-1">{tool} · {n}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* revenue-share schema */}
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("Revenue-share schema", "Schema chia doanh thu"))}</h2>
      <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
        <table className="w-full border-collapse text-left text-[0.86rem]">
          <thead>
            <tr className="border-b border-border">
              {["Plan", tr(t("Price / mo", "Giá / tháng")), tr(t("Developer / OPC", "Nhà phát triển / OPC")), "RAI ONE", tr(t("Includes", "Bao gồm"))].map((h) => (
                <th key={h} className="label px-4 py-3 text-text-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-4 py-3 font-medium text-text">Free</td>
              <td className="mono px-4 py-3 text-text">$0</td>
              <td className="mono px-4 py-3 text-text-2">—</td>
              <td className="mono px-4 py-3 text-text-2">—</td>
              <td className="px-4 py-3 text-text-2">{tr(t("Basic tool calls, community support", "Tool call cơ bản, hỗ trợ cộng đồng"))}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium text-text">Premium</td>
              <td className="mono px-4 py-3 text-text">${PREMIUM_PRICE}</td>
              <td className="mono px-4 py-3" style={{ color: "var(--color-ok)" }}>{Math.round(DEV_SHARE * 100)}% · ${(PREMIUM_PRICE * DEV_SHARE).toFixed(1)}</td>
              <td className="mono px-4 py-3 text-text">{Math.round((1 - DEV_SHARE) * 100)}% · ${(PREMIUM_PRICE * (1 - DEV_SHARE)).toFixed(1)}</td>
              <td className="px-4 py-3 text-text-2">{tr(t("Higher limits, priority support, premium tools", "Hạn mức cao, hỗ trợ ưu tiên, tool premium"))}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[0.8rem] text-text-2">{tr(t("Developers / OPCs receive 70% of net app revenue. Payments are not yet processed — this is the accounting schema only.", "Nhà phát triển / OPC nhận 70% doanh thu ròng của app. Chưa xử lý thanh toán — đây chỉ là schema hạch toán."))}</p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-6 text-center">
      <div className="font-[family-name:var(--font-display)] text-[1.6rem] font-medium text-text">{value}</div>
      <div className="mono mt-1 text-[0.66rem] uppercase tracking-wide text-text-2">{label}</div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
      <div className="text-[0.72rem] text-text-2">{label}</div>
      <div className="mono mt-0.5 text-[1rem] font-medium text-text">{value}</div>
    </div>
  );
}
