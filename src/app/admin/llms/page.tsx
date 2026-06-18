"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
const field = "rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";

type Tab = "stats" | "markups" | "providers";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`/api/llms-admin/${path}`, init);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function AdminLLMs() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("stats");
  const tabs: { id: Tab; label: T }[] = [
    { id: "stats", label: t("Stats", "Thống kê") },
    { id: "markups", label: t("Markups", "Markup") },
    { id: "providers", label: t("Provider keys", "Khóa nhà cung cấp") },
  ];
  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · RAI LLMs gateway", "Quản trị · RAI LLMs gateway"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("LLM gateway", "Cổng LLM"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>{tr(tb.label)}</button>
        ))}
      </nav>
      {tab === "stats" && <StatsTab />}
      {tab === "markups" && <MarkupsTab />}
      {tab === "providers" && <ProvidersTab />}
    </main>
  );
}

function GatewayError({ status }: { status: number }) {
  const { tr } = useLang();
  return (
    <div className="border border-dashed border-border bg-surface p-6 text-[0.9rem] text-text-2">
      {status === 503
        ? tr(t("Gateway not configured. Set RAI_LLMS_BASE + RAI_LLMS_ADMIN_TOKEN on the server, then deploy the gateway.", "Chưa cấu hình gateway. Đặt RAI_LLMS_BASE + RAI_LLMS_ADMIN_TOKEN trên máy chủ và deploy gateway."))
        : tr(t("Couldn't reach the gateway. Is it deployed and running?", "Không kết nối được gateway. Đã deploy và chạy chưa?"))}
    </div>
  );
}

function StatsTab() {
  const { tr } = useLang();
  const [state, setState] = useState<{ loading: boolean; err: number; data: { totals?: { requests: string; revenue: string; prompt: string; completion: string }; byModel?: { model_slug: string; requests: string; revenue: string }[]; topupsTotalVnd?: number } | null }>({ loading: true, err: 0, data: null });
  useEffect(() => { (async () => { const r = await api("stats"); setState({ loading: false, err: r.ok ? 0 : r.status, data: r.data }); })(); }, []);
  if (state.loading) return <p className="text-[0.9rem] text-text-2">{tr(t("Loading…", "Đang tải…"))}</p>;
  if (state.err) return <GatewayError status={state.err} />;
  const totals = state.data?.totals;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [t("Requests", "Request"), totals?.requests ?? "0"],
          [t("Revenue (cost)", "Doanh thu (cost)"), `$${Number(totals?.revenue ?? 0).toFixed(4)}`],
          [t("Prompt tokens", "Token vào"), totals?.prompt ?? "0"],
          [t("Top-ups (VND)", "Đã nạp (VND)"), Number(state.data?.topupsTotalVnd ?? 0).toLocaleString("vi-VN")],
        ].map(([l, v]) => (
          <div key={(l as T).en} className="border border-border bg-surface p-4"><div className="text-[1.3rem] font-medium text-text">{v as string}</div><div className="text-[0.78rem] text-text-2">{tr(l as T)}</div></div>
        ))}
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-[0.86rem]">
          <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Model", "Mô hình"))}</th><th className="p-3 font-medium">{tr(t("Requests", "Request"))}</th><th className="p-3 font-medium">{tr(t("Revenue", "Doanh thu"))}</th></tr></thead>
          <tbody>
            {(state.data?.byModel ?? []).map((r) => (
              <tr key={r.model_slug} className="border-t border-border"><td className="p-3 mono text-text">{r.model_slug}</td><td className="p-3 mono text-text-2">{r.requests}</td><td className="p-3 mono text-text-2">${Number(r.revenue).toFixed(4)}</td></tr>
            ))}
            {(state.data?.byModel ?? []).length === 0 && <tr><td colSpan={3} className="p-6 text-center text-text-2">{tr(t("No usage yet.", "Chưa có dữ liệu."))}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type Markup = { id: string; scope: string; target: string | null; percent: string };
function MarkupsTab() {
  const { tr } = useLang();
  const [rows, setRows] = useState<Markup[] | null>(null);
  const [err, setErr] = useState(0);
  const [scope, setScope] = useState("model");
  const [target, setTarget] = useState("");
  const [percent, setPercent] = useState("20");

  const load = useCallback(async () => { const r = await api("markups"); if (r.ok) { setRows(r.data.data ?? []); setErr(0); } else setErr(r.status); }, []);
  useEffect(() => { load(); }, [load]);

  async function add() {
    await api("markups", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scope, target: scope === "global" ? null : target, percent: Number(percent) }) });
    setTarget(""); load();
  }
  async function del(id: string) { await api(`markups/${id}`, { method: "DELETE" }); load(); }

  if (err) return <GatewayError status={err} />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 border border-border bg-surface p-4">
        <label className="block"><span className="label mb-1 block text-text-2">{tr(t("Scope", "Phạm vi"))}</span>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className={field}><option value="global">global</option><option value="provider">provider</option><option value="model">model</option></select>
        </label>
        <label className="block flex-1"><span className="label mb-1 block text-text-2">{tr(t("Target (model/provider slug)", "Đích (slug model/provider)"))}</span>
          <input value={target} onChange={(e) => setTarget(e.target.value)} disabled={scope === "global"} placeholder="anthropic/claude-sonnet-4.6" className={`${field} w-full disabled:opacity-50`} />
        </label>
        <label className="block"><span className="label mb-1 block text-text-2">%</span><input value={percent} onChange={(e) => setPercent(e.target.value)} className={`${field} w-20`} /></label>
        <button onClick={add} className={buttonClass("primary", "sm")}>{tr(t("Add / update", "Thêm / cập nhật"))}</button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-[0.86rem]">
          <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Scope", "Phạm vi"))}</th><th className="p-3 font-medium">{tr(t("Target", "Đích"))}</th><th className="p-3 font-medium">%</th><th className="p-3"></th></tr></thead>
          <tbody>
            {(rows ?? []).map((m) => (
              <tr key={m.id} className="border-t border-border"><td className="p-3 mono text-text">{m.scope}</td><td className="p-3 mono text-text-2">{m.target ?? "—"}</td><td className="p-3 mono text-text">{m.percent}</td><td className="p-3 text-right"><button onClick={() => del(m.id)} className="text-[0.78rem] text-err hover:underline">{tr(t("Delete", "Xóa"))}</button></td></tr>
            ))}
            {(rows ?? []).length === 0 && <tr><td colSpan={4} className="p-6 text-center text-text-2">{tr(t("No markups.", "Chưa có markup."))}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProvidersTab() {
  const { tr } = useLang();
  const [slug, setSlug] = useState("anthropic");
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  async function save() {
    if (!key.trim()) return;
    const r = await api(`providers/${slug}/credential`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: key.trim() }) });
    setMsg(r.ok ? tr(t("Saved (encrypted).", "Đã lưu (mã hóa).")) : r.status === 503 ? tr(t("Gateway not configured.", "Chưa cấu hình gateway.")) : tr(t("Failed.", "Thất bại.")));
    setKey("");
  }
  return (
    <div className="max-w-[560px] space-y-3 border border-border bg-surface p-5">
      <p className="text-[0.88rem] text-text-2">{tr(t("Store an upstream provider key. It is encrypted (AES-256-GCM) on the gateway and never returned.", "Lưu khóa nhà cung cấp thượng nguồn. Khóa được mã hóa (AES-256-GCM) trên gateway và không bao giờ trả về."))}</p>
      <label className="block"><span className="label mb-1 block text-text-2">{tr(t("Provider", "Nhà cung cấp"))}</span>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className={`${field} w-full`}><option value="openai">openai</option><option value="anthropic">anthropic</option><option value="google">google</option><option value="deepseek">deepseek</option></select>
      </label>
      <label className="block"><span className="label mb-1 block text-text-2">{tr(t("Upstream API key", "Khóa API thượng nguồn"))}</span>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-…" className={`${field} w-full`} />
      </label>
      <div className="flex items-center gap-3"><button onClick={save} disabled={!key.trim()} className={buttonClass("primary", "sm")}>{tr(t("Save", "Lưu"))}</button>{msg && <span className="text-[0.8rem] text-text-2">{msg}</span>}</div>
    </div>
  );
}
