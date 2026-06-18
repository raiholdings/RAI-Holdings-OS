import { NextResponse } from "next/server";
import { getModelById } from "@/lib/llms";

export const dynamic = "force-dynamic";

// Phase-1/2 MOCK gateway. Returns an OpenAI-compatible completion without calling
// any upstream provider (no keys in this repo). The real gateway replaces this.

type InMsg = { role: string; content: string };

function estTokens(s: string): number {
  return Math.max(1, Math.ceil((s || "").length / 4));
}

function buildReply(model: string, messages: InMsg[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const q = lastUser.slice(0, 180);
  return (
    `Xin chào! Đây là RAI LLMs ở chế độ demo (mock gateway). ` +
    `Yêu cầu của bạn đã được định tuyến tới model "${model}". ` +
    (q ? `Bạn vừa hỏi: "${q}". ` : "") +
    `Khi gateway thật tại llms.raiholdings.vn bật, câu trả lời sẽ đến từ model thực qua API tương thích OpenAI — ` +
    `cùng schema, chỉ đổi baseURL và API key. Mọi request đều trả usage chi tiết kèm chi phí (cost) để minh bạch.`
  );
}

function costOf(model: string, pt: number, ct: number): number {
  const m = getModelById(model);
  if (!m) return 0;
  const c = pt * parseFloat(m.pricing.prompt) + ct * parseFloat(m.pricing.completion);
  return Math.round(c * 1e6) / 1e6;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    model?: string; models?: string[]; messages?: InMsg[]; stream?: boolean;
  };
  const model = body.model || body.models?.[0] || "anthropic/claude-sonnet-4.6";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const reply = buildReply(model, messages);

  const pt = messages.reduce((n, m) => n + estTokens(m.content), 0);
  const ct = estTokens(reply);
  const usage = { prompt_tokens: pt, completion_tokens: ct, total_tokens: pt + ct, cost: costOf(model, pt, ct) };
  const id = `gen-${Date.now().toString(36)}`;
  const created = Math.floor(Date.now() / 1000);

  if (!body.stream) {
    return NextResponse.json({
      id, object: "chat.completion", created, model,
      choices: [{ finish_reason: "stop", native_finish_reason: "stop", message: { role: "assistant", content: reply } }],
      usage,
    }, { headers: { "cache-control": "no-store" } });
  }

  // streaming SSE
  const tokens = reply.split(/(\s+)/); // keep spaces
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ id, object: "chat.completion.chunk", created, model, choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null, native_finish_reason: null }] });
      for (const tok of tokens) {
        send({ id, object: "chat.completion.chunk", created, model, choices: [{ index: 0, delta: { content: tok }, finish_reason: null, native_finish_reason: null }] });
        await new Promise((r) => setTimeout(r, 18));
      }
      send({ id, object: "chat.completion.chunk", created, model, choices: [{ index: 0, delta: {}, finish_reason: "stop", native_finish_reason: "stop" }], usage });
      controller.enqueue(enc.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store", connection: "keep-alive" },
  });
}
