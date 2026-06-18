import type {
  Adapter,
  ProviderKey,
  NormalizedRequest,
  ResolvedEndpoint,
  CompleteResult,
  StreamEvent,
  ChatMessage,
} from "../types.js";
import { GatewayError, normalizeFinish } from "../types.js";
import { sseLines } from "./base.js";

// OpenAI Chat Completions is the native schema. The same class also serves
// DeepSeek, which is OpenAI-compatible — only the providerKey differs.
export class OpenAIAdapter implements Adapter {
  providerKey: ProviderKey;

  constructor(providerKey: ProviderKey = "openai") {
    this.providerKey = providerKey;
  }

  private buildBody(n: NormalizedRequest, ep: ResolvedEndpoint, stream: boolean): Record<string, unknown> {
    const messages: ChatMessage[] = [];
    if (n.system) messages.push({ role: "system", content: n.system });
    messages.push(...n.messages);

    const body: Record<string, unknown> = {
      model: ep.upstreamModel,
      messages,
      stream,
    };
    if (n.maxTokens !== undefined) body.max_tokens = n.maxTokens;
    if (n.temperature !== undefined) body.temperature = n.temperature;
    if (n.topP !== undefined) body.top_p = n.topP;
    if (n.stop !== undefined) body.stop = n.stop;
    if (n.responseFormat !== undefined) body.response_format = n.responseFormat;
    if (stream) body.stream_options = { include_usage: true };
    return body;
  }

  async complete(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): Promise<CompleteResult> {
    const res = await fetch(`${ep.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${upstreamKey}`,
      },
      body: JSON.stringify(this.buildBody(n, ep, false)),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError(res.status, "upstream_error", `OpenAI upstream ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const choice = data.choices?.[0];
    const content = choice?.message?.content ?? "";
    const nativeFinish = choice?.finish_reason ?? "stop";

    return {
      content,
      finishReason: normalizeFinish(nativeFinish),
      nativeFinish,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }

  async *stream(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): AsyncIterable<StreamEvent> {
    const res = await fetch(`${ep.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${upstreamKey}`,
      },
      body: JSON.stringify(this.buildBody(n, ep, true)),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError(res.status, "upstream_error", `OpenAI upstream ${res.status}: ${text.slice(0, 500)}`);
    }

    for await (const payload of sseLines(res)) {
      let chunk: {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      try {
        chunk = JSON.parse(payload);
      } catch {
        continue; // partial / malformed chunk
      }

      const choice = chunk.choices?.[0];
      const text = choice?.delta?.content;
      if (text) yield { type: "delta", text };

      if (chunk.usage) {
        yield {
          type: "usage",
          usage: {
            promptTokens: chunk.usage.prompt_tokens ?? 0,
            completionTokens: chunk.usage.completion_tokens ?? 0,
          },
        };
      }

      const fr = choice?.finish_reason;
      if (fr) {
        yield { type: "finish", finishReason: normalizeFinish(fr), nativeFinish: fr };
      }
    }
  }
}
