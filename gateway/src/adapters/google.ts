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

type GeminiPart = { text?: string };
type GeminiCandidate = {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
};
type GeminiResponse = {
  candidates?: GeminiCandidate[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
};

// Gemini (generateContent) adapter normalized to the OpenAI-shaped contract.
export class GoogleAdapter implements Adapter {
  providerKey: ProviderKey = "google";

  private buildBody(n: NormalizedRequest): Record<string, unknown> {
    const contents = n.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: asText(m.content) }],
      }));

    const generationConfig: Record<string, unknown> = {};
    if (n.maxTokens !== undefined) generationConfig.maxOutputTokens = n.maxTokens;
    if (n.temperature !== undefined) generationConfig.temperature = n.temperature;
    if (n.topP !== undefined) generationConfig.topP = n.topP;
    if (n.stop !== undefined) generationConfig.stopSequences = n.stop;

    const body: Record<string, unknown> = { contents };
    if (n.system) body.systemInstruction = { parts: [{ text: n.system }] };
    if (Object.keys(generationConfig).length > 0) body.generationConfig = generationConfig;
    return body;
  }

  private extractText(candidate: GeminiCandidate | undefined): string {
    return (candidate?.content?.parts ?? [])
      .map((p) => p.text ?? "")
      .join("");
  }

  async complete(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): Promise<CompleteResult> {
    const url = `${ep.baseUrl}/models/${ep.upstreamModel}:generateContent?key=${encodeURIComponent(upstreamKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(this.buildBody(n)),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError(res.status, "upstream_error", `Google upstream ${res.status}: ${text.slice(0, 500)}`);
    }

    const data = (await res.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];
    const content = this.extractText(candidate);
    const nativeFinish = candidate?.finishReason ?? "STOP";

    return {
      content,
      finishReason: normalizeFinish(nativeFinish),
      nativeFinish,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  async *stream(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): AsyncIterable<StreamEvent> {
    const url = `${ep.baseUrl}/models/${ep.upstreamModel}:streamGenerateContent?alt=sse&key=${encodeURIComponent(upstreamKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(this.buildBody(n)),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new GatewayError(res.status, "upstream_error", `Google upstream ${res.status}: ${text.slice(0, 500)}`);
    }

    let promptTokens = 0;
    let completionTokens = 0;
    let nativeFinish = "";

    for await (const payload of sseLines(res)) {
      let chunk: GeminiResponse;
      try {
        chunk = JSON.parse(payload);
      } catch {
        continue;
      }

      const candidate = chunk.candidates?.[0];
      const text = this.extractText(candidate);
      if (text) yield { type: "delta", text };

      if (chunk.usageMetadata) {
        if (chunk.usageMetadata.promptTokenCount !== undefined) promptTokens = chunk.usageMetadata.promptTokenCount;
        if (chunk.usageMetadata.candidatesTokenCount !== undefined) completionTokens = chunk.usageMetadata.candidatesTokenCount;
      }

      if (candidate?.finishReason) nativeFinish = candidate.finishReason;
    }

    yield { type: "usage", usage: { promptTokens, completionTokens } };
    if (nativeFinish) {
      yield { type: "finish", finishReason: normalizeFinish(nativeFinish), nativeFinish };
    }
  }
}
