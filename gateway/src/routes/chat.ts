import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";
import { authenticate } from "../auth.js";
import { preCheck, debit, recordRequest } from "../billing.js";
import { resolveChain } from "../router.js";
import { getAdapter } from "../adapters/base.js";
import { getUpstreamKey } from "../upstream.js";
import { computeCost } from "../usage.js";
import { GatewayError, type ChatRequest, type ChatMessage, type NormalizedRequest, type ProviderUsage } from "../types.js";

const genId = () => "gen-" + randomBytes(12).toString("base64url");

function normalize(body: ChatRequest): { n: NormalizedRequest; modelIds: string[] } {
  const raw: ChatMessage[] = body.messages ?? (body.prompt ? [{ role: "user", content: body.prompt }] : []);
  const system = raw.filter((m) => m.role === "system").map((m) => (typeof m.content === "string" ? m.content : "")).filter(Boolean).join("\n\n");
  const n: NormalizedRequest = {
    system: system || undefined,
    messages: raw.filter((m) => m.role !== "system"),
    maxTokens: body.max_tokens,
    temperature: body.temperature,
    topP: body.top_p,
    stop: typeof body.stop === "string" ? [body.stop] : body.stop,
    responseFormat: body.response_format,
  };
  const modelIds = body.models?.length ? body.models : body.model ? [body.model] : [];
  if (!modelIds.length) throw new GatewayError(400, "no_model", "`model` or `models` is required");
  return { n, modelIds };
}

export default async function chatRoute(app: FastifyInstance) {
  app.post("/chat/completions", async (req, reply) => {
    const principal = await authenticate(req.headers.authorization);
    await preCheck(principal);
    const body = req.body as ChatRequest;
    const { n, modelIds } = normalize(body);
    const chain = resolveChain(modelIds, body.provider);
    const gid = genId();
    const created = Math.floor(Date.now() / 1000);
    const started = Date.now();

    // ---- non-streaming: fallback across the whole chain ----
    if (!body.stream) {
      let lastErr: unknown;
      for (const hop of chain) {
        try {
          const up = await getUpstreamKey(hop.endpoint.providerKey, principal.userId);
          const r = await getAdapter(hop.endpoint.providerKey).complete(n, hop.endpoint, up.key);
          const cost = await computeCost(r.usage, hop.endpoint, hop.modelId);
          const billedUsd = up.byok ? 0 : cost.billedUsd;
          await debit(principal, up.byok ? 0 : cost.billedVnd, gid);
          await recordRequest({ userId: principal.userId, apiKeyId: principal.apiKeyId, genId: gid, modelSlug: hop.modelId, providerSlug: hop.endpoint.providerKey, promptTokens: r.usage.promptTokens, completionTokens: r.usage.completionTokens, costUsd: billedUsd, latencyMs: Date.now() - started, finishReason: r.finishReason, status: "ok" });
          return reply.send({
            id: gid, object: "chat.completion", created, model: hop.modelId,
            choices: [{ index: 0, finish_reason: r.finishReason, native_finish_reason: r.nativeFinish, message: { role: "assistant", content: r.content } }],
            usage: { prompt_tokens: r.usage.promptTokens, completion_tokens: r.usage.completionTokens, total_tokens: r.usage.promptTokens + r.usage.completionTokens, cost: billedUsd },
          });
        } catch (e) { lastErr = e; /* try next provider */ }
      }
      throw lastErr instanceof GatewayError ? lastErr : new GatewayError(502, "all_failed", "All providers failed");
    }

    // ---- streaming: SSE; fallback only before first token ----
    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store", connection: "keep-alive" });
    const send = (o: unknown) => res.write(`data: ${JSON.stringify(o)}\n\n`);

    let started2 = false;
    let lastErr: unknown;
    for (const hop of chain) {
      let usage: ProviderUsage = { promptTokens: 0, completionTokens: 0 };
      let finish = "stop", nativeFinish = "stop";
      try {
        const up = await getUpstreamKey(hop.endpoint.providerKey, principal.userId);
        for await (const ev of getAdapter(hop.endpoint.providerKey).stream(n, hop.endpoint, up.key)) {
          if (ev.type === "delta") { started2 = true; send({ id: gid, object: "chat.completion.chunk", created, model: hop.modelId, choices: [{ index: 0, delta: { content: ev.text }, finish_reason: null, native_finish_reason: null }] }); }
          else if (ev.type === "usage") usage = ev.usage;
          else if (ev.type === "finish") { finish = ev.finishReason; nativeFinish = ev.nativeFinish; }
        }
        const cost = await computeCost(usage, hop.endpoint, hop.modelId);
        const billedUsd = up.byok ? 0 : cost.billedUsd;
        await debit(principal, up.byok ? 0 : cost.billedVnd, gid);
        await recordRequest({ userId: principal.userId, apiKeyId: principal.apiKeyId, genId: gid, modelSlug: hop.modelId, providerSlug: hop.endpoint.providerKey, promptTokens: usage.promptTokens, completionTokens: usage.completionTokens, costUsd: billedUsd, latencyMs: Date.now() - started, finishReason: finish, status: "ok" });
        send({ id: gid, object: "chat.completion.chunk", created, model: hop.modelId, choices: [{ index: 0, delta: {}, finish_reason: finish, native_finish_reason: nativeFinish }], usage: { prompt_tokens: usage.promptTokens, completion_tokens: usage.completionTokens, total_tokens: usage.promptTokens + usage.completionTokens, cost: billedUsd } });
        res.write("data: [DONE]\n\n"); res.end(); return;
      } catch (e) { lastErr = e; if (started2) break; /* else fall back to next */ }
    }
    send({ error: { message: lastErr instanceof Error ? lastErr.message : "All providers failed", code: "all_failed" } });
    res.write("data: [DONE]\n\n"); res.end();
  });
}
