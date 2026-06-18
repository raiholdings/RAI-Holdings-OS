"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useCurrentOrg, refreshRemote, creditLocal } from "@/lib/workspace-store";

const WRAP = "mx-auto max-w-[900px] px-5 sm:px-8";
const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";
const PRESETS = [100_000, 500_000, 1_000_000];

type Txn = { id: string; kind: string; amountVnd: number; balanceAfter: number; note: string; createdAt: string };
type UsageEvent = { id: string; product: string; model: string; units: number; costVnd: number; createdAt: string };

const kindTone: Record<string, string> = {
  topup: "text-ok", refund: "text-ok", debit: "text-err", adjust: "text-text-2",
};

export default function BillingPage() {
  const { tr, lang } = useLang();
  const org = useCurrentOrg();
  const [dbOn, setDbOn] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [usage, setUsage] = useState<UsageEvent[]>([]);
  const [busy, setBusy] = useState(false);

  const fmtDate = (s: string) => { try { return new Date(s).toLocaleString(lang === "vi" ? "vi-VN" : "en-GB"); } catch { return s; } };

  const load = useCallback(async () => {
    if (!org) return;
    const res = await fetch(`/api/workspace/v0/billing?org=${encodeURIComponent(org.id)}`, { credentials: "include" });
    const j = await res.json().catch(() => ({}));
    if (j.db === false) { setDbOn(false); return; }
    setDbOn(true);
    setBalance(j.balanceVnd ?? 0);
    setTxns(j.txns ?? []);
    setUsage(j.usage ?? []);
  }, [org]);

  useEffect(() => { load(); }, [load]);

  async function topUp(amount: number) {
    if (!org) return;
    setBusy(true);
    try {
      if (dbOn) {
        const res = await fetch("/api/workspace/v0/billing/topup", {
          method: "POST", credentials: "include", headers: { "content-type": "application/json" },
          body: JSON.stringify({ orgId: org.id, amountVnd: amount }),
        });
        if (res.ok) { await refreshRemote(); await load(); }
      } else {
        creditLocal(amount); // demo top-up in local mode
      }
    } finally { setBusy(false); }
  }

  const shownBalance = dbOn ? (balance ?? 0) : (org?.balanceVnd ?? 0);

  return (
    <div className={`${WRAP} py-8`}>
      <div className="label mb-2 text-accent">{tr(t("Venture Builder", "Trình tạo doanh nghiệp"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Billing & credits", "Thanh toán & credit"))}</h1>
      <p className="mt-2 max-w-[640px] text-[0.95rem] text-text-2">
        {tr(t(
          "Ventures, engines and LLM calls draw from your organization's VND credit balance.",
          "Doanh nghiệp, engine và lượt gọi LLM trừ vào số dư credit VND của tổ chức.",
        ))}
      </p>

      {/* balance */}
      <div className="mt-6 border border-border bg-surface p-6">
        <div className="flex items-center gap-2 text-text-2">
          <Icon name="coins" size={16} className="text-accent" />
          <span className="label">{tr(t("Current balance", "Số dư hiện tại"))}</span>
        </div>
        <div className="mono mt-2 text-[2.4rem] font-medium tracking-tight text-text">{fmtVnd(shownBalance)}</div>
        <div className="mt-1 text-[0.82rem] text-text-2">{org?.name}{!dbOn ? ` · ${tr(t("demo (this device)", "demo (thiết bị này)"))}` : ""}</div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => topUp(p)} disabled={busy} className={buttonClass("outline", "md")}>
              <Icon name="receipt" size={15} /> +{fmtVnd(p)}
            </button>
          ))}
        </div>
        <p className="mono mt-3 text-[0.72rem] text-text-2">
          {dbOn
            ? tr(t("Manual credit. VNPay/MoMo settlement comes in Phase 3.", "Cộng credit thủ công. Thanh toán VNPay/MoMo ở Phase 3."))
            : tr(t("Demo top-up — kept on this device until the database is enabled.", "Nạp demo — lưu trên thiết bị này cho tới khi bật cơ sở dữ liệu."))}
        </p>
      </div>

      {dbOn === false && (
        <div className="mt-4 border border-dashed border-border bg-bg p-4">
          <p className="text-[0.85rem] text-text-2">
            {tr(t(
              "Transaction ledger and usage history need the database. Set SUPABASE_URL + service role on the server to enable persistent billing.",
              "Sổ giao dịch và lịch sử sử dụng cần cơ sở dữ liệu. Đặt SUPABASE_URL + service role trên máy chủ để bật thanh toán lưu bền.",
            ))}
          </p>
        </div>
      )}

      {dbOn && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* ledger */}
          <section>
            <h2 className="text-[1.05rem] font-medium text-text">{tr(t("Transactions", "Giao dịch"))}</h2>
            <div className="mt-3 divide-y divide-border border border-border bg-surface">
              {txns.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[0.84rem] text-text">{tx.note || tx.kind}</div>
                    <div className="mono text-[0.7rem] text-text-2">{fmtDate(tx.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("mono text-[0.86rem]", kindTone[tx.kind] ?? "text-text")}>{tx.amountVnd > 0 ? "+" : ""}{fmtVnd(tx.amountVnd)}</div>
                    <div className="mono text-[0.68rem] text-text-2">{fmtVnd(tx.balanceAfter)}</div>
                  </div>
                </div>
              ))}
              {txns.length === 0 && <div className="px-4 py-6 text-center text-[0.84rem] text-text-2">{tr(t("No transactions yet.", "Chưa có giao dịch."))}</div>}
            </div>
          </section>

          {/* usage */}
          <section>
            <h2 className="text-[1.05rem] font-medium text-text">{tr(t("Usage", "Sử dụng"))}</h2>
            <div className="mt-3 divide-y divide-border border border-border bg-surface">
              {usage.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[0.84rem] text-text">{u.product}{u.model ? ` · ${u.model}` : ""}</div>
                    <div className="mono text-[0.7rem] text-text-2">{fmtDate(u.createdAt)} · {u.units}×</div>
                  </div>
                  <div className="mono text-[0.84rem] text-text-2">{fmtVnd(u.costVnd)}</div>
                </div>
              ))}
              {usage.length === 0 && <div className="px-4 py-6 text-center text-[0.84rem] text-text-2">{tr(t("No usage yet.", "Chưa có lượt dùng."))}</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
