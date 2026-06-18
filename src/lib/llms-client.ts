/* RAI LLMs — browser client (Phase 1/2).
   Talks to the RAI LLMs gateway (OpenAI-compatible). Defaults to the in-app
   mock routes (/api/llms/v0); point NEXT_PUBLIC_RAI_LLMS_BASE at the real
   self-hosted gateway (https://llms.raiholdings.vn/api/v1) when live.
   No upstream provider keys ever live here. */

export const RAI_LLMS_BASE =
  process.env.NEXT_PUBLIC_RAI_LLMS_BASE ?? "/api/llms/v0";

export type Role = "user" | "assistant" | "system" | "tool";
export type ChatMessage = { role: Role; content: string; name?: string; tool_call_id?: string };

export interface ProviderPreferences {
  sort?: "price" | "throughput" | "latency";
  order?: string[];
  ignore?: string[];
  allow_fallbacks?: boolean;
  data_collection?: "allow" | "deny";
  require_parameters?: boolean;
}

export interface ChatRequest {
  model?: string;
  models?: string[];
  route?: "fallback";
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string | string[];
  stream?: boolean;
  provider?: ProviderPreferences;
  user?: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
}

export interface ChatResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    finish_reason: string | null;
    native_finish_reason: string | null;
    message: { role: string; content: string | null };
  }>;
  usage: Usage;
}

export class RaiLLMs {
  constructor(
    private apiKey: string = "",
    private baseURL: string = RAI_LLMS_BASE,
    private appTitle = "RAI OS",
  ) {}

  private headers() {
    const h: Record<string, string> = { "Content-Type": "application/json", "X-RAI-Title": this.appTitle };
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST", headers: this.headers(), body: JSON.stringify({ ...req, stream: false }),
    });
    if (!res.ok) throw new Error(`chat ${res.status}: ${await res.text()}`);
    return res.json();
  }

  /** Streaming SSE — onToken per delta; onDone with final usage. */
  async chatStream(req: ChatRequest, onToken: (d: string) => void, onDone?: (u?: Usage) => void): Promise<void> {
    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST", headers: this.headers(), body: JSON.stringify({ ...req, stream: true }),
    });
    if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let usage: Usage | undefined;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const ts = line.trim();
        if (!ts || ts.startsWith(":") || !ts.startsWith("data:")) continue;
        const data = ts.slice(5).trim();
        if (data === "[DONE]") { onDone?.(usage); return; }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onToken(delta);
          if (json.usage) usage = json.usage;
        } catch { /* partial chunk */ }
      }
    }
    onDone?.(usage);
  }
}
