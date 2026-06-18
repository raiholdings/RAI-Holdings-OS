"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import {
  listModels, providers, providerName, rankings, getModelById, llmsStats, perMillion,
  type Model, type ProviderKey,
} from "@/lib/llms";
import { Playground } from "@/components/llms/Playground";
import { Dashboard } from "@/components/llms/Dashboard";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

type TabId = "models" | "chat" | "rankings" | "providers" | "pricing" | "dashboard" | "docs";
const TABS: { id: TabId; label: T; icon: string }[] = [
  { id: "models", label: t("Models", "Mô hình"), icon: "cpu" },
  { id: "chat", label: t("Chat", "Chat"), icon: "message" },
  { id: "rankings", label: t("Rankings", "Xếp hạng"), icon: "trending-up" },
  { id: "providers", label: t("Providers", "Nhà cung cấp"), icon: "server" },
  { id: "pricing", label: t("Pricing", "Bảng giá"), icon: "receipt" },
  { id: "dashboard", label: t("Dashboard", "Bảng điều khiển"), icon: "layout" },
  { id: "docs", label: t("Docs", "Tài liệu"), icon: "file-text" },
];

export function LLMsView({ embedded = false }: { embedded?: boolean }) {
  const { tr, lang, setLang } = useLang();
  const [active, setActive] = useState<TabId>("models");

  return (
    <div className={embedded ? "" : "min-h-dvh bg-bg"}>
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
        {!embedded && (
          <div className={`${WRAP} flex h-16 items-center justify-between gap-4`}>
            <div className="flex items-center gap-4"><Link href="/"><Logo /></Link><span className="mono hidden text-[0.7rem] text-text-2 sm:inline">/ LLMS</span></div>
            <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
              {(["en", "vi"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>)}
            </div>
          </div>
        )}
        <div className={`${WRAP} flex gap-0.5 overflow-x-auto`}>
          {TABS.map((x) => (
            <button key={x.id} onClick={() => setActive(x.id)} className={cn("flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-[0.85rem] transition-colors", active === x.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
              <Icon name={x.icon} size={15} />{tr(x.label)}
            </button>
          ))}
        </div>
      </header>

      <main className={`${WRAP} py-8`}>
        {active === "models" && <ModelsTab />}
        {active === "chat" && <Playground />}
        {active === "rankings" && <RankingsTab />}
        {active === "providers" && <ProvidersTab />}
        {active === "pricing" && <PricingTab />}
        {active === "dashboard" && <Dashboard />}
        {active === "docs" && <DocsTab />}
      </main>
    </div>
  );
}

function Hero() {
  const { tr } = useLang();
  const s = llmsStats();
  const cards: { v: string; l: T }[] = [
    { v: String(s.models), l: t("Models", "Mô hình") },
    { v: String(s.providers), l: t("Providers", "Nhà cung cấp") },
    { v: String(s.vietnamese), l: t("Vietnamese-friendly", "Hợp tiếng Việt") },
    { v: `${(s.maxContext / 1000).toLocaleString("en")}K`, l: t("Max context", "Ngữ cảnh tối đa") },
  ];
  return (
    <div className="mb-6">
      <div className="label mb-2 text-accent">{tr(t("RAI LLMs", "RAI LLMs"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("One API for every model", "Một API cho mọi mô hình"))}</h1>
      <p className="mt-2 max-w-[640px] text-[0.95rem] text-text-2">{tr(t("Unified LLM gateway — OpenAI-compatible, smart routing & fallback, transparent cost. Billed in VND credits.", "Cổng LLM hợp nhất — tương thích OpenAI, định tuyến & dự phòng thông minh, chi phí minh bạch. Thanh toán bằng credit VND."))}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={tr(c.l)} className="border border-border bg-surface p-4">
            <div className="text-[1.4rem] font-medium tracking-tight text-text">{c.v}</div>
            <div className="text-[0.78rem] text-text-2">{tr(c.l)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Models tab -----------------------------------------------------------
function ModelsTab() {
  const { tr } = useLang();
  const [q, setQ] = useState("");
  const [author, setAuthor] = useState<ProviderKey | "all">("all");
  const [sort, setSort] = useState<"price" | "context" | "name">("price");
  const [sel, setSel] = useState<Model | null>(null);

  const rows = useMemo(() => {
    let list = listModels();
    if (author !== "all") list = list.filter((m) => m.author === author);
    if (q.trim()) {
      const k = q.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(k) || m.id.toLowerCase().includes(k) || m.tags.some((tg) => tg.includes(k)));
    }
    return [...list].sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name)
        : sort === "context" ? b.contextLength - a.contextLength
          : parseFloat(a.pricing.prompt) - parseFloat(b.pricing.prompt));
  }, [q, author, sort]);

  return (
    <div>
      <Hero />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5">
          <Icon name="search" size={16} className="text-text-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(t("Search models…", "Tìm mô hình…"))} className="w-full bg-transparent text-[0.9rem] text-text outline-none placeholder:text-text-2" />
        </div>
        <select value={author} onChange={(e) => setAuthor(e.target.value as ProviderKey | "all")} className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-[0.86rem] text-text">
          <option value="all">{tr(t("All providers", "Tất cả NCC"))}</option>
          {providers.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-[0.86rem] text-text">
          <option value="price">{tr(t("Sort: price", "Sắp: giá"))}</option>
          <option value="context">{tr(t("Sort: context", "Sắp: ngữ cảnh"))}</option>
          <option value="name">{tr(t("Sort: name", "Sắp: tên"))}</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <button key={m.id} onClick={() => setSel(m)} className="flex flex-col border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="grid size-8 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-[0.62rem] font-medium uppercase text-accent">{m.author.slice(0, 2)}</span>
              {m.vietnamese && <span className="mono rounded-[var(--radius-md)] bg-ok/15 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wider text-ok">VI</span>}
            </div>
            <div className="text-[0.96rem] font-medium text-text">{m.name}</div>
            <div className="mono text-[0.68rem] text-text-2">{m.id}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {m.tags.slice(0, 3).map((tg) => <span key={tg} className="mono rounded-[var(--radius-md)] bg-bg px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-text-2">{tg}</span>)}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[0.74rem] text-text-2">
              <span>{(m.contextLength / 1000).toLocaleString("en")}K ctx</span>
              <span className="mono">{perMillion(m.pricing.prompt)}/{perMillion(m.pricing.completion)} <span className="text-[0.62rem]">/1M</span></span>
            </div>
          </button>
        ))}
      </div>

      {sel && <ModelModal model={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ModelModal({ model, onClose }: { model: Model; onClose: () => void }) {
  const { tr } = useLang();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-[640px] overflow-y-auto border border-border bg-bg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-[1.15rem] font-medium text-text">{model.name}</div>
            <div className="mono text-[0.7rem] text-text-2">{model.id}</div>
          </div>
          <button onClick={onClose} aria-label="close"><Icon name="x" size={18} className="text-text-2 hover:text-text" /></button>
        </div>
        <p className="text-[0.9rem] text-text-2">{tr(model.description)}</p>

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
          {[
            [t("Context", "Ngữ cảnh"), `${(model.contextLength / 1000).toLocaleString("en")}K`],
            [t("Input /1M", "Vào /1M"), perMillion(model.pricing.prompt)],
            [t("Output /1M", "Ra /1M"), perMillion(model.pricing.completion)],
            [t("Modality", "Phương thức"), model.modality],
          ].map(([l, v]) => (
            <div key={typeof l === "string" ? l : (l as T).en} className="bg-surface p-3">
              <div className="label text-text-2">{tr(l as T)}</div>
              <div className="mono mt-0.5 text-[0.82rem] text-text">{v as string}</div>
            </div>
          ))}
        </div>

        <h4 className="mt-5 mb-2 text-[0.8rem] font-medium uppercase tracking-wider text-text-2">{tr(t("Providers serving this model", "Nhà cung cấp phục vụ"))}</h4>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-[0.82rem]">
            <thead><tr className="bg-surface text-text-2"><th className="p-2.5 font-medium">{tr(t("Provider", "NCC"))}</th><th className="p-2.5 font-medium">{tr(t("In/Out /1M", "Vào/Ra /1M"))}</th><th className="p-2.5 font-medium">{tr(t("Thrpt", "T.lượng"))}</th><th className="p-2.5 font-medium">{tr(t("Uptime", "Uptime"))}</th></tr></thead>
            <tbody>
              {model.endpoints.map((e) => (
                <tr key={e.provider} className="border-t border-border">
                  <td className="p-2.5 text-text">{e.provider} {e.status === "degraded" && <span className="mono text-[0.6rem] text-warn">●</span>}</td>
                  <td className="p-2.5 mono text-text-2">{perMillion(e.pricePrompt)}/{perMillion(e.priceCompletion)}</td>
                  <td className="p-2.5 mono text-text-2">{e.throughput} t/s</td>
                  <td className="p-2.5 mono text-text-2">{e.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="mt-5 mb-2 text-[0.8rem] font-medium uppercase tracking-wider text-text-2">{tr(t("Supported parameters", "Tham số hỗ trợ"))}</h4>
        <div className="flex flex-wrap gap-1">
          {model.supportedParameters.map((p) => <span key={p} className="mono rounded-[var(--radius-md)] bg-surface px-1.5 py-0.5 text-[0.64rem] text-text-2">{p}</span>)}
        </div>
      </div>
    </div>
  );
}

// ---- Rankings tab ---------------------------------------------------------
function RankingsTab() {
  const { tr } = useLang();
  const max = Math.max(...rankings.map((r) => r.sharePct));
  return (
    <div>
      <h2 className="text-[1.3rem] font-medium tracking-tight text-text">{tr(t("Model rankings", "Xếp hạng mô hình"))}</h2>
      <p className="mt-1 mb-5 text-[0.9rem] text-text-2">{tr(t("By tokens processed across RAI LLMs (last 30 days · illustrative).", "Theo lượng token xử lý qua RAI LLMs (30 ngày · minh họa)."))}</p>
      <div className="space-y-2">
        {rankings.map((r) => {
          const m = getModelById(r.id);
          return (
            <div key={r.id} className="flex items-center gap-4 border border-border bg-surface p-3">
              <span className="mono w-6 text-center text-[0.9rem] text-text-2">{r.rank}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="truncate text-[0.9rem] font-medium text-text">{m?.name ?? r.id}</span><span className="mono text-[0.66rem] text-text-2">{providerName(m?.author ?? "openai")}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg"><div className="h-full rounded-full bg-accent" style={{ width: `${(r.sharePct / max) * 100}%` }} /></div>
              </div>
              <div className="text-right">
                <div className="mono text-[0.84rem] text-text">{r.tokens}</div>
                <div className="mono text-[0.64rem] text-text-2">{r.sharePct}% · {r.trend === "up" ? "▲" : r.trend === "down" ? "▼" : "—"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Providers tab --------------------------------------------------------
function ProvidersTab() {
  const { tr } = useLang();
  return (
    <div>
      <h2 className="text-[1.3rem] font-medium tracking-tight text-text">{tr(t("Providers", "Nhà cung cấp"))}</h2>
      <p className="mt-1 mb-5 text-[0.9rem] text-text-2">{tr(t("Upstream providers RAI LLMs routes to, with their data policies.", "Các nhà cung cấp thượng nguồn RAI LLMs định tuyến tới, kèm chính sách dữ liệu."))}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {providers.map((p) => (
          <div key={p.key} className="border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-[0.62rem] font-medium uppercase text-accent">{p.key.slice(0, 2)}</span>
                <span className="text-[0.96rem] font-medium text-text">{p.name}</span>
              </div>
              <span className="mono text-[0.7rem] text-text-2">{p.models} {tr(t("models", "mô hình"))}</span>
            </div>
            <p className="mt-2 text-[0.82rem] text-text-2"><span className="label mr-1 text-text-2">{tr(t("Data", "Dữ liệu"))}</span>{tr(p.dataPolicy)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Pricing tab ----------------------------------------------------------
function PricingTab() {
  const { tr } = useLang();
  const rows = [...listModels()].sort((a, b) => parseFloat(a.pricing.prompt) - parseFloat(b.pricing.prompt));
  return (
    <div>
      <h2 className="text-[1.3rem] font-medium tracking-tight text-text">{tr(t("Pricing", "Bảng giá"))}</h2>
      <p className="mt-1 mb-5 max-w-[680px] text-[0.9rem] text-text-2">{tr(t("Per-token rates (reference, USD per 1M). Charged from your VND credit balance with a small platform fee; VAT e-invoices for businesses.", "Đơn giá theo token (tham khảo, USD/1M). Trừ vào số dư credit VND kèm phí nền tảng nhỏ; hóa đơn VAT điện tử cho doanh nghiệp."))}</p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-[0.86rem]">
          <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Model", "Mô hình"))}</th><th className="p-3 font-medium">{tr(t("Context", "Ngữ cảnh"))}</th><th className="p-3 font-medium">{tr(t("Input /1M", "Vào /1M"))}</th><th className="p-3 font-medium">{tr(t("Output /1M", "Ra /1M"))}</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="p-3"><div className="text-text">{m.name}</div><div className="mono text-[0.66rem] text-text-2">{m.id}</div></td>
                <td className="p-3 mono text-text-2">{(m.contextLength / 1000).toLocaleString("en")}K</td>
                <td className="p-3 mono text-text">{perMillion(m.pricing.prompt)}</td>
                <td className="p-3 mono text-text">{perMillion(m.pricing.completion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---- Docs tab -------------------------------------------------------------
function DocsTab() {
  const { tr } = useLang();
  const snippet = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://llms.raiholdings.vn/api/v1",
  apiKey: process.env.RAI_API_KEY,    // your RAI key
});

const res = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4.6",
  messages: [{ role: "user", content: "Xin chào RAI LLMs" }],
});
console.log(res.choices[0].message.content);`;

  const endpoints: { m: string; p: string; d: T }[] = [
    { m: "POST", p: "/chat/completions", d: t("Chat (OpenAI-compatible, streaming)", "Chat (tương thích OpenAI, streaming)") },
    { m: "GET", p: "/models", d: t("Model catalog", "Danh mục mô hình") },
    { m: "GET", p: "/models/{author}/{slug}/endpoints", d: t("Providers for a model", "NCC của một mô hình") },
    { m: "GET", p: "/credits", d: t("Credit balance", "Số dư credit") },
    { m: "GET", p: "/generation?id=", d: t("Request stats (cost, latency)", "Thống kê request (cost, latency)") },
  ];

  return (
    <div className="max-w-[760px]">
      <h2 className="text-[1.3rem] font-medium tracking-tight text-text">{tr(t("Quickstart", "Bắt đầu nhanh"))}</h2>
      <p className="mt-1 mb-4 text-[0.9rem] text-text-2">{tr(t("Drop-in compatible with the OpenAI SDK — change only baseURL and apiKey.", "Tương thích drop-in với OpenAI SDK — chỉ đổi baseURL và apiKey."))}</p>
      <pre className="mono overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface p-4 text-[0.76rem] leading-relaxed text-text">{snippet}</pre>

      <h3 className="mt-6 mb-2 text-[1rem] font-medium text-text">{tr(t("Endpoints", "Endpoint"))}</h3>
      <div className="overflow-hidden border border-border">
        <table className="w-full text-left text-[0.84rem]">
          <tbody>
            {endpoints.map((e) => (
              <tr key={e.p} className="border-b border-border last:border-0">
                <td className="p-3"><span className="mono rounded-[var(--radius-md)] bg-accent/10 px-1.5 py-0.5 text-[0.64rem] font-medium text-accent">{e.m}</span></td>
                <td className="p-3 mono text-text">{e.p}</td>
                <td className="p-3 text-text-2">{tr(e.d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[0.8rem] text-text-2">{tr(t("Base URL", "Base URL"))}: <span className="mono text-text">https://llms.raiholdings.vn/api/v1</span> · {tr(t("Auth", "Xác thực"))}: <span className="mono text-text">Authorization: Bearer &lt;RAI_API_KEY&gt;</span></p>
    </div>
  );
}
