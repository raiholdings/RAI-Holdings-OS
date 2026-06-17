"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useSubscriptions, useBillingEvents, cancelSub, type Sub } from "@/lib/marketplace-store";
import { formatVnd } from "@/lib/marketplace";
import { useLang, t } from "@/lib/i18n";

const DEV_SHARE = 0.7;
const statusTone: Record<Sub["status"], string> = { active: "var(--color-ok)", trialing: "var(--color-accent)", canceled: "var(--color-text-2)", past_due: "var(--color-err)" };

export default function MarketBilling() {
  const { tr } = useLang();
  const subs = useSubscriptions();
  const events = useBillingEvents();

  const monthly = (s: Sub) => (s.billingCycle === "yearly" ? Math.round(s.priceYearly / 12) : s.priceMonthly);
  const active = subs.filter((s) => s.status === "active" || s.status === "trialing");
  const mrr = active.reduce((n, s) => n + monthly(s), 0);

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Phase 5 · Billing", "Phase 5 · Thanh toán"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("Subscriptions, events & revenue share", "Đăng ký, sự kiện & chia doanh thu"))}</h1>
        <p className="mt-3 text-[0.98rem] text-text-2">{tr(t("Your purchases, the marketplace_purchase event log, and the revenue-share schema. Payments are mocked (no gateway yet).", "Các gói bạn mua, nhật ký sự kiện marketplace_purchase, và schema chia doanh thu. Thanh toán giả lập (chưa có cổng).") )}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border lg:grid-cols-4">
        <Stat label={tr(t("Active subscriptions", "Đăng ký đang hoạt động"))} value={String(active.length)} />
        <Stat label={tr(t("Est. MRR", "MRR ước tính"))} value={formatVnd(mrr)} />
        <Stat label={tr(t("Events", "Sự kiện"))} value={String(events.length)} />
        <Stat label={tr(t("Dev share", "Chia cho dev"))} value={`${Math.round(DEV_SHARE * 100)}%`} />
      </div>

      {/* subscriptions */}
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("Your subscriptions", "Đăng ký của bạn"))}</h2>
      {subs.length === 0 ? (
        <div className="mt-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">{tr(t("No subscriptions yet.", "Chưa có đăng ký."))} <Link href="/marketplace" className="font-medium text-accent">{tr(t("Browse →", "Khám phá →"))}</Link></div>
      ) : (
        <div className="mt-3 grid gap-3">
          {subs.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/marketplace/${s.slug}`} className="font-[family-name:var(--font-display)] text-[1rem] font-medium text-text hover:underline">{s.listingName}</Link>
                  <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.62rem] uppercase" style={{ color: statusTone[s.status], background: `color-mix(in srgb, ${statusTone[s.status]} 12%, transparent)` }}>{s.status}</span>
                </div>
                <div className="mono mt-1 text-[0.72rem] text-text-2">
                  {s.planName} · {s.billingCycle === "yearly" ? formatVnd(s.priceYearly) + "/" + tr(t("yr", "năm")) : formatVnd(s.priceMonthly) + "/" + tr(t("mo", "tháng"))} · {tr(t("renews", "gia hạn"))} {new Date(s.currentPeriodEnd).toLocaleDateString("vi-VN")}
                </div>
                {s.pendingChange && <div className="mono mt-1 text-[0.7rem]" style={{ color: "var(--color-warn)" }}>⏳ {tr(t("downgrade to", "hạ xuống"))} {s.pendingChange.planName} · {new Date(s.pendingChange.effectiveDate).toLocaleDateString("vi-VN")}</div>}
              </div>
              <div className="flex flex-none items-center gap-3">
                <span className="mono text-[0.72rem] text-text-2">{tr(t("dev", "dev"))} {formatVnd(Math.round(monthly(s) * DEV_SHARE))}/{tr(t("mo", "tháng"))}</span>
                {s.status !== "canceled" && <button onClick={() => cancelSub(s.id)} className="rounded-[var(--radius-md)] border border-border-strong px-3 py-1.5 text-[0.8rem] text-text">{tr(t("Cancel", "Hủy"))}</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* event log */}
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("marketplace_purchase events", "Sự kiện marketplace_purchase"))}</h2>
      <div className="mt-3 overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        {events.length === 0 ? <p className="p-8 text-center text-[0.85rem] text-text-2">{tr(t("No events yet.", "Chưa có sự kiện."))}</p> : (
          <ul>{events.map((e) => (
            <li key={e.seq} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-0">
              <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem] uppercase" style={{ color: e.action === "cancelled" ? "var(--color-err)" : e.action === "purchased" ? "var(--color-ok)" : "var(--color-warn)", background: `color-mix(in srgb, ${e.action === "cancelled" ? "var(--color-err)" : e.action === "purchased" ? "var(--color-ok)" : "var(--color-warn)"} 12%, transparent)` }}>{e.action}</span>
              <span className="text-[0.86rem] text-text">{e.listingName}</span>
              <span className="mono text-[0.72rem] text-text-2">{e.planName} · {e.detail}</span>
              <span className="mono ml-auto text-[0.7rem] text-text-2">{new Date(e.effectiveDate).toLocaleDateString("vi-VN")}</span>
            </li>
          ))}</ul>
        )}
      </div>

      {/* revenue schema */}
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("Revenue-share schema", "Schema chia doanh thu"))}</h2>
      <div className="mt-3 overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface">
        <table className="w-full border-collapse text-left text-[0.86rem]">
          <thead><tr className="border-b border-border">{[tr(t("Party", "Bên")), tr(t("Share", "Tỷ lệ")), tr(t("Note", "Ghi chú"))].map((h) => <th key={h} className="label px-4 py-3 text-text-2">{h}</th>)}</tr></thead>
          <tbody>
            <tr className="border-b border-border"><td className="px-4 py-3 font-medium text-text">{tr(t("Publisher / OPC", "Nhà phát hành / OPC"))}</td><td className="mono px-4 py-3" style={{ color: "var(--color-ok)" }}>{Math.round(DEV_SHARE * 100)}%</td><td className="px-4 py-3 text-text-2">{tr(t("Net of fees, paid to verified publisher", "Sau phí, trả cho nhà phát hành xác thực"))}</td></tr>
            <tr><td className="px-4 py-3 font-medium text-text">RAI OS</td><td className="mono px-4 py-3 text-text">{Math.round((1 - DEV_SHARE) * 100)}%</td><td className="px-4 py-3 text-text-2">{tr(t("Platform, billing, distribution", "Nền tảng, thanh toán, phân phối"))}</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[0.8rem] text-text-2">{tr(t("Prices in VND. Each paid plan has both monthly and yearly. Upgrades apply immediately; downgrades at period end; 14-day free trials supported.", "Giá bằng VND. Mỗi gói trả phí có cả giá tháng và năm. Nâng cấp hiệu lực ngay; hạ cấp cuối chu kỳ; hỗ trợ dùng thử 14 ngày."))}</p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-surface px-5 py-6 text-center"><div className="font-[family-name:var(--font-display)] text-[1.4rem] font-medium text-text">{value}</div><div className="mono mt-1 text-[0.66rem] uppercase tracking-wide text-text-2">{label}</div></div>;
}
