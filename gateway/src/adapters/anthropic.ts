import type {
  Adapter,
  ProviderKey,
  NormalizedRequest,
  ResolvedEndpoint,
  CompleteResult,
  StreamEvent,
} from "../types.js";
import { GatewayError, normalizeFinish } from "../types.js";
import { sseLines, asText } from "./base.js";

const ANTHROPIC_VERSION = "2023-06-01";

// Anthropic Messages API adapter, normalized to the OpenAI-shaped contract.
export class AnthropicAdapter implements Adapter {
  providerKey: ProviderKey = "anthropic";

  private buildBody(n: NormalizedRequest, ep: ResolvedEndpoint, stream: boolean): Record<string, unknown> {
    // Anthropic keeps system separate and only accepts user/assistant turns in
    // the messages array. Drop tool/system roles; map content to a string.
    const messages = n.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: asText(m.content),
      }));

    const body: Record<string, unknown> = {
      model: ep.upstreamModel,
      max_tokens: n.maxTokens ?? 4096,
      messages,
    };
    if (n.system) body.system = n.system;
    if (n.temperature !== undefined) body.temperature = n.temperature;
    if (n.topP !== undefined) body.top_p = n.topP;
    if (n.stop !== undefined) body.stop_sequences = n.stop;
    if (stream) body.stream = true;
    return body;
  }

  private headers(upstreamKey: string): Record<string, string> {
    return {
      "content-type": "application/json",
      "x-api-key": upstreamKey,
      "anthropic-version": ANTHROPIC_VERSION,
    };
  }

  async complete(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): Promise<CompleteResult> {
    const res = await fetch(`${ep.baseUrl}/messages`, {
      method: "POST",
      headers: this.headers(upstreamKey),
      body: JSON.stringify(this.buildBody(n, ep, false)),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError(res.status, "upstream_error", `Anthropic upstream ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      stop_reason?: string;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const content = (data.content ?? [])
      .filter((b) => b.type === "text" || typeof b.text === "string")
      .map((b) => b.text ?? "")
      .join("");
    const nativeFinish = data.stop_reason ?? "end_turn";

    return {
      content,
      finishReason: normalizeFinish(nativeFinish),
      nativeFinish,
      usage: {
        promptTokens: data.usage?.input_tokens ?? 0,
        completionTokens: data.usage?.output_tokens ?? 0,
      },
    };
  }

  async *stream(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): AsyncIterable<StreamEvent> {
    const res = await fetch(`${ep.baseUrl}/messages`, {
      method: "POST",
      headers: this.headers(upstreamKey),
      body: JSON.stringify(this.buildBody(n, ep, true)),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError(res.status, "upstream_error", `Anthropic upstream ${res.status}: ${text.slice(0, 500)}`);
    }

    let promptTokens = 0;
    let completionTokens = 0;
    let nativeFinish = "end_turn";

    for await (const payload of sseLines(res)) {
      let evt: {
        type?: string;
        message?: { usage?: { input_tokens?: number; output_tokens?: number } };
        delta?: { type?: string; text?: string; stop_reason?: string };
        usage?: { input_tokens?: number; output_tokens?: number };
      };
      try {
        evt = JSON.parse(payload);
      } catch {
        continue;
      }

      switch (evt.type) {
        case "message_start": {
          const u = evt.message?.usage;
          if (u?.input_tokens !== undefined) promptTokens = u.input_tokens;
          if (u?.output_tokens !== undefined) completionTokens = u.output_tokens;
          break;
        }
        case "content_block_delta": {
          const text = evt.delta?.text;
          if (text) yield { type: "delta", text };
          break;
        }
        case "message_delta": {
          if (evt.usage?.output_tokens !== undefined) completionTokens = evt.usage.output_tokens;
          if (evt.delta?.stop_reason) nativeFinish = evt.delta.stop_reason;
          break;
        }
        case "message_stop": {
          yield { type: "usage", usage: { promptTokens, completionTokens } };
          yield { type: "finish", finishReason: normalizeFinish(nativeFinish), nativeFinish };
          break;
        }
        default:
          break;
      }
    }
  }
}
