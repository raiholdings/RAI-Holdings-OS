// Shared contract for the RAI LLMs gateway (OpenAI-compatible + internal types).

export type ProviderKey = "openai" | "anthropic" | "google" | "deepseek";

export type Role = "system" | "user" | "assistant" | "tool";
export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: string } };
export type ChatMessage = {
  role: Role;
  content: string | ContentPart[];
  name?: string;
  tool_call_id?: string;
};

export type ProviderPreferences = {
  sort?: "price" | "throughput" | "latency";
  order?: string[];
  ignore?: string[];
  allow_fallbacks?: boolean;
  data_collection?: "allow" | "deny"; // "deny" => ZDR-only routing
  require_parameters?: boolean;
};

// Inbound OpenAI-compatible request body.
export type ChatRequest = {
  model?: string;
  models?: string[];
  route?: "fallback";
  messages?: ChatMessage[];
  prompt?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  seed?: number;
  stream?: boolean;
  response_format?: { type: "json_object" } | { type: "json_schema"; json_schema: { name: string; strict?: boolean; schema: object } };
  provider?: ProviderPreferences;
  user?: string;
  plugins?: Plugin[];
};

// Gateway plugins (web search, file parser, …). `id` selects the plugin.
export type Plugin = { id: string; [k: string]: unknown };

// Provider-agnostic request the adapters consume.
export type NormalizedRequest = {
  system?: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
  responseFormat?: ChatRequest["response_format"];
};

export type ProviderUsage = { promptTokens: number; completionTokens: number };

// A concrete provider endpoint serving a model (resolved by the router).
export type ResolvedEndpoint = {
  providerKey: ProviderKey;
  upstreamModel: string;   // real provider model id, e.g. "claude-sonnet-4-6"
  baseUrl: string;
  pricePrompt: number;     // USD per token (upstream cost basis)
  priceCompletion: number;
  zdr: boolean;            // provider commits to no-retention on this endpoint
};

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "usage"; usage: ProviderUsage }
  | { type: "finish"; finishReason: string; nativeFinish: string };

export type CompleteResult = {
  content: string;
  finishReason: string;   // normalized: stop|length|tool_calls|content_filter|error
  nativeFinish: string;
  usage: ProviderUsage;
};

// Every provider adapter implements this.
export interface Adapter {
  providerKey: ProviderKey;
  complete(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): Promise<CompleteResult>;
  stream(n: NormalizedRequest, ep: ResolvedEndpoint, upstreamKey: string): AsyncIterable<StreamEvent>;
}

// Authenticated principal for a request.
export type Principal = {
  userId: string;
  apiKeyId: string;
  keyHash: string;
  limitCredits: number | null; // per-key budget (VND), null = unlimited
  usedCredits: number;
};

export class GatewayError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function normalizeFinish(provider: string): string {
  const p = (provider || "").toLowerCase();
  if (["stop", "end_turn", "stop_sequence", "complete"].includes(p)) return "stop";
  if (["length", "max_tokens", "model_length"].includes(p)) return "length";
  if (["tool_calls", "tool_use", "function_call"].includes(p)) return "tool_calls";
  if (["content_filter", "safety", "blocked"].includes(p)) return "content_filter";
  return p || "stop";
}
