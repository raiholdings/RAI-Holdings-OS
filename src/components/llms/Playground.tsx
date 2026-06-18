"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { listModels, getModelById, providerName } from "@/lib/llms";
import { RaiLLMs, type ChatMessage, type Usage } from "@/lib/llms-client";
import { hydrateStore, usePresets, savePreset, logChat } from "@/lib/llms-store";

const field = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";
type Sort = "price" | "throughput" | "latency";

export function Playground() {
  const { tr } = useLang();
  const catalog = listModels();
  const presets = usePresets();
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [modelA, setModelA] = useState(catalog[1]?.id ?? catalog[0].id);
  const [modelB, setModelB] = useState(catalog[3]?.id ?? catalog[0].id);
  const [sort, setSort] = useState<Sort>("price");
  const [system, setSystem] = useState("");
  const [convA, setConvA] = useState<ChatMessage[]>([]);
  const [convB, setConvB] = useState<ChatMessage[]>([]);
  const [usageA, setUsageA] = useState<Usage | null>(null);
  const [usageB, setUsageB] = useState<Usage | null>(null);
  const [busyA, setBusyA] = useState(false);
  const [busyB, setBusyB] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => { hydrateStore(); }, []);

  function streamInto(
    model: string, history: ChatMessage[],
    setConv: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setBusy: (b: boolean) => void, setUsage: (u: Usage | null) => void,
  ) {
    const client = new RaiLLMs();
    const payload: ChatMessage[] = system.trim() ? [{ role: "system", content: system.trim() }, ...history] : history;
    client.chatStream(
      { model, messages: payload, provider: { sort, allow_fallbacks: true }, route: "fallback" },
      (delta) => setConv((c) => { const copy = [...c]; copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + delta }; return copy; }),
      (u) => {
        setBusy(false); setUsage(u ?? null);
        if (u) { const m = getModelById(model); logChat({ model, provider: providerName(m?.author ?? "openai"), promptTokens: u.prompt_tokens, completionTokens: u.completion_tokens, costUsd: u.cost ?? 0, finishReason: "stop" }); }
      },
    ).catch(() => { setBusy(false); setConv((c) => { const copy = [...c]; copy[copy.length - 1] = { role: "assistant", content: tr(t("⚠️ Gateway unavailable (demo).", "⚠️ Gateway chưa sẵn sàng (demo).")) }; return copy; }); });
  }

  function send() {
    const text = input.trim();
    if (!text || busyA || busyB) return;
    const user: ChatMessage = { role: "user", content: text };
    const nextA = [...convA, user];
    setConvA([...nextA, { role: "assistant", content: "" }]); setBusyA(true); setUsageA(null);
    streamInto(modelA, nextA, setConvA, setBusyA, setUsageA);
    if (mode === "compare") {
      const nextB = [...convB, user];
      setConvB([...nextB, { role: "assistant", content: "" }]); setBusyB(true); setUsageB(null);
      streamInto(modelB, nextB, setConvB, setBusyB, setUsageB);
    }
    setInput("");
  }

  function clearAll() { setConvA([]); setConvB([]); setUsageA(null); setUsageB(null); }

  function doSavePreset() {
    const name = window.prompt(tr(t("Preset name", "Tên preset")));
    if (name?.trim()) savePreset({ name: name.trim(), model: modelA, system, sort });
  }
  function applyPreset(id: string) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setModelA(p.model); setSystem(p.system); setSort(p.sort);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* config */}
      <aside className="space-y-4">
        <div className="border border-border bg-surface p-4">
          <div className="mb-3 flex overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.78rem]">
            {(["single", "compare"] as const).map((mo) => (
              <button key={mo} onClick={() => setMode(mo)} className={cn("flex-1 px-2 py-1.5 transition-colors", mode === mo ? "bg-accent text-white" : "text-text-2 hover:text-text")}>
                {mo === "single" ? tr(t("Single", "Đơn")) : tr(t("Compare", "So sánh"))}
              </button>
            ))}
          </div>
          <label className="label mb-1 block text-text-2">{mode === "compare" ? tr(t("Model A", "Mô hình A")) : tr(t("Model", "Mô hình"))}</label>
          <select value={modelA} onChange={(e) => setModelA(e.target.value)} className={field}>
            {catalog.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {mode === "compare" && (
            <>
              <label className="label mb-1 mt-3 block text-text-2">{tr(t("Model B", "Mô hình B"))}</label>
              <select value={modelB} onChange={(e) => setModelB(e.target.value)} className={field}>
                {catalog.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </>
          )}
          <label className="label mb-1 mt-3 block text-text-2">{tr(t("Route by", "Định tuyến theo"))}</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field}>
            <option value="price">{tr(t("Lowest price", "Giá thấp nhất"))}</option>
            <option value="throughput">{tr(t("Highest throughput", "Thông lượng cao"))}</option>
            <option value="latency">{tr(t("Lowest latency", "Độ trễ thấp"))}</option>
          </select>
          <label className="label mb-1 mt-3 block text-text-2">{tr(t("System prompt", "System prompt"))}</label>
          <textarea value={system} onChange={(e) => setSystem(e.target.value)} rows={3} placeholder={tr(t("Optional…", "Tùy chọn…"))} className={field} />
        </div>

        {/* presets */}
        <div className="border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="label text-text-2">{tr(t("Presets", "Preset"))}</span>
            <button onClick={doSavePreset} className="text-[0.76rem] text-accent hover:underline">{tr(t("Save current", "Lưu hiện tại"))}</button>
          </div>
          {presets.length === 0 ? <p className="text-[0.76rem] text-text-2">{tr(t("None saved.", "Chưa lưu."))}</p> : (
            <select onChange={(e) => { if (e.target.value) applyPreset(e.target.value); }} defaultValue="" className={field}>
              <option value="" disabled>{tr(t("Apply preset…", "Áp preset…"))}</option>
              {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>

        <button onClick={clearAll} className={cn(buttonClass("ghost", "sm"), "w-full")}><Icon name="x" size={14} /> {tr(t("Clear conversation", "Xóa hội thoại"))}</button>
        <p className="mono text-[0.64rem] text-text-2">{tr(t("Demo gateway · responses mocked, credits charged from your demo balance.", "Gateway demo · câu trả lời mô phỏng, trừ vào số dư demo."))}</p>
      </aside>

      {/* conversation(s) */}
      <div className={cn("grid gap-3", mode === "compare" && "lg:grid-cols-2")}>
        <Column title={getModelById(modelA)?.name ?? modelA} conv={convA} usage={usageA} busy={busyA} />
        {mode === "compare" && <Column title={getModelById(modelB)?.name ?? modelB} conv={convB} usage={usageB} busy={busyB} />}
      </div>

      {/* composer spans full width under columns */}
      <div className="lg:col-start-2">
        <div className="flex items-end gap-2 border border-border bg-surface p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder={tr(t("Message RAI LLMs…", "Nhắn RAI LLMs…"))}
            className="max-h-32 flex-1 resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-border-strong"
          />
          <button onClick={send} disabled={busyA || busyB || !input.trim()} className={buttonClass("primary", "sm")}>
            <Icon name="send" size={15} />{busyA || busyB ? "…" : tr(t("Send", "Gửi"))}
          </button>
        </div>
      </div>
    </div>
  );
}

function Column({ title, conv, usage, busy }: { title: string; conv: ChatMessage[]; usage: Usage | null; busy: boolean }) {
  const { tr } = useLang();
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight })); }, [conv]);
  return (
    <div className="flex h-[520px] flex-col border border-border bg-surface">
      <div className="border-b border-border px-4 py-2 text-[0.8rem] font-medium text-text">{title}</div>
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
        {conv.length === 0 && (
          <div className="grid h-full place-items-center text-center text-[0.88rem] text-text-2">
            <div><Icon name="message" size={26} className="mx-auto mb-2 text-text-2" />{tr(t("Send a message to try.", "Gửi tin nhắn để thử."))}</div>
          </div>
        )}
        {conv.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-md)] px-3 py-2 text-[0.88rem]", m.role === "user" ? "bg-accent text-white" : "border border-border bg-bg text-text")}>
              {m.content || (busy && i === conv.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
      </div>
      {usage && (
        <div className="mono flex flex-wrap gap-x-4 border-t border-border px-4 py-2 text-[0.66rem] text-text-2">
          <span>{tr(t("tokens", "token"))}: {usage.prompt_tokens}+{usage.completion_tokens}</span>
          {typeof usage.cost === "number" && <span>cost: ${usage.cost.toFixed(6)}</span>}
        </div>
      )}
    </div>
  );
}
