import type { Adapter, ProviderKey, ChatMessage, ContentPart } from "../types.js";
import { OpenAIAdapter } from "./openai.js";
import { AnthropicAdapter } from "./anthropic.js";
import { GoogleAdapter } from "./google.js";

// Provider registry. The same OpenAIAdapter class serves both "openai" and
// "deepseek" (DeepSeek is OpenAI-compatible at the wire level).
export const adapters: Record<ProviderKey, Adapter> = {
  openai: new OpenAIAdapter("openai"),
  deepseek: new OpenAIAdapter("deepseek"),
  anthropic: new AnthropicAdapter(),
  google: new GoogleAdapter(),
};

export function getAdapter(k: ProviderKey): Adapter {
  return adapters[k];
}

// Extract plain text from a message content value. Content may be a string or
// an array of typed parts; for MVP we concatenate the text parts and ignore
// non-text parts (images are passed through by providers that support them at
// the message-mapping layer, not here).
export function asText(content: ChatMessage["content"]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((p): p is Extract<ContentPart, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Defensive SSE line reader shared by all adapters.
// Reads the response body, decodes incrementally, splits on newlines, strips
// the `data:` prefix, skips comments/empty lines, and stops on `[DONE]`.
// Yields the raw payload string after `data:` for each event line.
export async function* sseLines(res: Response): AsyncGenerator<string> {
  const body = res.body;
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const rawLine = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        const out = parseSseLine(rawLine);
        if (out === DONE) return;
        if (out !== null) yield out;
      }
    }
    // flush any trailing buffered line
    const out = parseSseLine(buffer);
    if (out !== null && out !== DONE) yield out;
  } finally {
    reader.releaseLock();
  }
}

const DONE = Symbol("sse-done");

function parseSseLine(rawLine: string): string | typeof DONE | null {
  const line = rawLine.replace(/\r$/, "").trim();
  if (!line) return null;
  if (line.startsWith(":")) return null; // comment / heartbeat
  if (!line.startsWith("data:")) return null;
  const payload = line.slice("data:".length).trim();
  if (!payload) return null;
  if (payload === "[DONE]") return DONE;
  return payload;
}
