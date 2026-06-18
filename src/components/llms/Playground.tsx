"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { listModels } from "@/lib/llms";
import { RaiLLMs, type ChatMessage, type Usage } from "@/lib/llms-client";

const field = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-[0.88rem] text-text outline-none focus:border-border-strong";

export function Playground() {
  const { tr } = useLang();
  const catalog = listModels();
  const [model, setModel] = useState(catalog[1]?.id ?? catalog[0].id);
  const [sort, setSort] = useState<"price" | "throughput" | "latency">("price");
  const [system, setSystem] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  function scroll() {
    requestAnimationFrame(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight }); });
  }

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setUsage(null);
    setStreaming(true);
    scroll();

    const client = new RaiLLMs();
    const payload: ChatMessage[] = system.trim() ? [{ role: "system", content: system.trim() }, ...next] : next;
    try {
      await client.chatStream(
        { model, messages: payload, provider: { sort, allow_fallbacks: true }, route: "fallback" },
        (delta) => {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + delta };
            return copy;
          });
          scroll();
        },
        (u) => { setUsage(u ?? null); setStreaming(false); scroll(); },
      );
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: tr(t("⚠️ Gateway unavailable (demo).", "⚠️ Gateway chưa sẵn sàng (demo).")) };
        return copy;
      });
      setStreaming(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* config */}
      <aside className="space-y-4">
        <div className="border border-border bg-surface p-4">
          <label className="label mb-1 block text-text-2">{tr(t("Model", "Mô hình"))}</label>
          <select value={model} onChange={(e) => setModel(e.target.value)} className={field}>
            {catalog.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label className="label mb-1 mt-3 block text-text-2">{tr(t("Route by", "Định tuyến theo"))}</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={field}>
            <option value="price">{tr(t("Lowest price", "Giá thấp nhất"))}</option>
            <option value="throughput">{tr(t("Highest throughput", "Thông lượng cao"))}</option>
            <option value="latency">{tr(t("Lowest latency", "Độ trễ thấp"))}</option>
          </select>
          <label className="label mb-1 mt-3 block text-text-2">{tr(t("System prompt", "System prompt"))}</label>
          <textarea value={system} onChange={(e) => setSystem(e.target.value)} rows={3} placeholder={tr(t("Optional…", "Tùy chọn…"))} className={field} />
        </div>
        <button onClick={() => { setMessages([]); setUsage(null); }} className={cn(buttonClass("ghost", "sm"), "w-full")}>
          <Icon name="x" size={14} /> {tr(t("Clear conversation", "Xóa hội thoại"))}
        </button>
        <p className="mono text-[0.64rem] text-text-2">{tr(t("Demo gateway · responses are mocked until llms.raiholdings.vn is live.", "Gateway demo · câu trả lời là mô phỏng cho tới khi llms.raiholdings.vn hoạt động."))}</p>
      </aside>

      {/* conversation */}
      <div className="flex h-[560px] flex-col border border-border bg-surface">
        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-center text-[0.9rem] text-text-2">
              <div>
                <Icon name="message" size={28} className="mx-auto mb-2 text-text-2" />
                {tr(t("Send a message to try the model.", "Gửi tin nhắn để thử mô hình."))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-[var(--radius-md)] px-3 py-2 text-[0.9rem]",
                m.role === "user" ? "bg-accent text-white" : "border border-border bg-bg text-text",
              )}>
                {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
              </div>
            </div>
          ))}
        </div>

        {usage && (
          <div className="mono flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-[0.66rem] text-text-2">
            <span>{tr(t("tokens", "token"))}: {usage.prompt_tokens}+{usage.completion_tokens}={usage.total_tokens}</span>
            {typeof usage.cost === "number" && <span>{tr(t("cost", "chi phí"))}: ${usage.cost.toFixed(6)}</span>}
          </div>
        )}

        <div className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder={tr(t("Message RAI LLMs…", "Nhắn RAI LLMs…"))}
            className="max-h-32 flex-1 resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-border-strong"
          />
          <button onClick={send} disabled={streaming || !input.trim()} className={buttonClass("primary", "sm")}>
            <Icon name="send" size={15} />{streaming ? tr(t("…", "…")) : tr(t("Send", "Gửi"))}
          </button>
        </div>
      </div>
    </div>
  );
}
