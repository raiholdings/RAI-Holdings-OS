"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { getModelById, providerName } from "@/lib/llms";
import {
  hydrateStore, useKeys, useBalance, useTransactions, useActivity, usePresets,
  createKey, revokeKey, topUp, deletePreset, fmtVnd, type ApiKey,
} from "@/lib/llms-store";

const field = "rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";

export function Dashboard() {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Credits />
        <Keys />
      </div>
      <Presets />
      <ActivityLog />
      <p className="mono text-[0.64rem] text-text-2">{tr(t("Demo dashboard · keys, credits and activity are stored locally until the gateway backend is live.", "Dashboard demo · key, credit và hoạt động lưu cục bộ cho tới khi backend gateway hoạt động."))}</p>
    </div>
  );
}

function Credits() {
  const { tr } = useLang();
  const balance = useBalance();
  const txns = useTransactions();
  return (
    <div className="border border-border bg-surface p-5">
      <div className="flex items-center gap-2"><Icon name="coins" size={16} className="text-accent" /><h3 className="text-[0.95rem] font-medium text-text">{tr(t("Credits", "Số dư"))}</h3></div>
      <div className="mt-3 text-[1.8rem] font-medium tracking-tight text-text">{fmtVnd(balance)}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[100_000, 500_000, 1_000_000].map((v) => (
          <button key={v} onClick={() => topUp(v)} className={buttonClass("outline", "sm")}>+ {fmtVnd(v)}</button>
        ))}
      </div>
      <div className="mt-4 max-h-40 space-y-1 overflow-y-auto">
        {txns.length === 0 && <p className="text-[0.8rem] text-text-2">{tr(t("No transactions yet.", "Chưa có giao dịch."))}</p>}
        {txns.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between border-b border-border py-1.5 text-[0.78rem] last:border-0">
            <span className="text-text-2">{tx.type === "topup" ? tr(t("Top-up", "Nạp")) : tr(t("Usage", "Dùng"))} · <span className="mono">{tx.ref}</span></span>
            <span className={cn("mono", tx.type === "topup" ? "text-ok" : "text-text-2")}>{tx.type === "topup" ? "+" : "−"}{fmtVnd(tx.vnd)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Keys() {
  const { tr } = useLang();
  const keys = useKeys();
  const [label, setLabel] = useState("");
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState("");

  function add() {
    if (!label.trim()) return;
    setJustCreated(createKey(label));
    setLabel("");
  }
  function copy(k: string) { navigator.clipboard?.writeText(k); setCopied(k); setTimeout(() => setCopied(""), 1500); }
  const mask = (k: string) => k.slice(0, 10) + "••••••" + k.slice(-4);

  return (
    <div className="border border-border bg-surface p-5">
      <div className="flex items-center gap-2"><Icon name="shield" size={16} className="text-accent" /><h3 className="text-[0.95rem] font-medium text-text">{tr(t("API keys", "API key"))}</h3></div>
      <div className="mt-3 flex gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={tr(t("Key label (e.g. Production)", "Nhãn key (vd Production)"))} className={`${field} flex-1`} />
        <button onClick={add} disabled={!label.trim()} className={buttonClass("primary", "sm")}>{tr(t("Create", "Tạo"))}</button>
      </div>
      {justCreated && (
        <div className="mt-3 border border-ok/40 bg-ok/5 p-3">
          <div className="label mb-1 text-ok">{tr(t("Copy now — shown once", "Copy ngay — chỉ hiện 1 lần"))}</div>
          <div className="flex items-center gap-2"><code className="mono flex-1 break-all text-[0.74rem] text-text">{justCreated.key}</code><button onClick={() => copy(justCreated.key)} className={buttonClass("outline", "sm")}>{copied === justCreated.key ? tr(t("Copied", "Đã copy")) : tr(t("Copy", "Copy"))}</button></div>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {keys.length === 0 && <p className="text-[0.8rem] text-text-2">{tr(t("No keys yet.", "Chưa có key."))}</p>}
        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-0">
            <div className="min-w-0"><div className="truncate text-[0.86rem] text-text">{k.label}</div><div className="mono text-[0.7rem] text-text-2">{mask(k.key)}</div></div>
            <button onClick={() => revokeKey(k.id)} className="text-[0.78rem] text-err hover:underline">{tr(t("Revoke", "Thu hồi"))}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Presets() {
  const { tr } = useLang();
  const presets = usePresets();
  if (presets.length === 0) return null;
  return (
    <div className="border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-2"><Icon name="stack" size={16} className="text-accent" /><h3 className="text-[0.95rem] font-medium text-text">{tr(t("Presets", "Preset"))}</h3></div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-2 border border-border bg-bg p-3">
            <div className="min-w-0"><div className="truncate text-[0.86rem] font-medium text-text">{p.name}</div><div className="mono truncate text-[0.66rem] text-text-2">{p.model}</div></div>
            <button onClick={() => deletePreset(p.id)} aria-label="delete"><Icon name="x" size={14} className="text-text-2 hover:text-err" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLog() {
  const { tr } = useLang();
  const activity = useActivity();
  return (
    <div className="overflow-hidden border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3"><Icon name="layout" size={16} className="text-accent" /><h3 className="text-[0.95rem] font-medium text-text">{tr(t("Activity", "Hoạt động"))}</h3></div>
      {activity.length === 0 ? (
        <p className="px-5 py-8 text-center text-[0.86rem] text-text-2">{tr(t("No requests yet. Try the Chat playground.", "Chưa có request. Thử tab Chat."))}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.82rem]">
            <thead><tr className="bg-bg text-text-2"><th className="p-3 font-medium">{tr(t("Time", "Thời gian"))}</th><th className="p-3 font-medium">{tr(t("Model", "Mô hình"))}</th><th className="p-3 font-medium">{tr(t("Tokens", "Token"))}</th><th className="p-3 font-medium">{tr(t("Cost", "Chi phí"))}</th></tr></thead>
            <tbody>
              {activity.slice(0, 50).map((a) => {
                const m = getModelById(a.model);
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="p-3 mono text-text-2">{new Date(a.ts).toLocaleTimeString("vi-VN")}</td>
                    <td className="p-3"><div className="text-text">{m?.name ?? a.model}</div><div className="mono text-[0.64rem] text-text-2">{providerName(m?.author ?? "openai")}</div></td>
                    <td className="p-3 mono text-text-2">{a.promptTokens}+{a.completionTokens}</td>
                    <td className="p-3 mono text-text">{fmtVnd(a.costVnd)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
