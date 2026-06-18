import type { ProviderKey, ResolvedEndpoint } from "./types.js";

// Static catalog for the gateway MVP. In production this comes from the
// `models` + `model_endpoints` tables (see sql/schema.sql) and the Admin UI.

const BASE: Record<ProviderKey, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  deepseek: "https://api.deepseek.com/v1",
};

export type CatalogModel = {
  id: string;            // author/slug exposed to clients
  name: string;
  contextLength: number;
  modality: string;
  supportedParameters: string[];
  endpoints: ResolvedEndpoint[];
};

const PARAMS = ["tools", "temperature", "top_p", "max_tokens", "stop", "response_format", "stream"];

function ep(providerKey: ProviderKey, upstreamModel: string, pricePrompt: number, priceCompletion: number, zdr = false): ResolvedEndpoint {
  return { providerKey, upstreamModel, baseUrl: BASE[providerKey], pricePrompt, priceCompletion, zdr };
}

export const catalog: CatalogModel[] = [
  { id: "anthropic/claude-opus-4.8", name: "Claude Opus 4.8", contextLength: 1_000_000, modality: "text+image->text", supportedParameters: PARAMS,
    endpoints: [ep("anthropic", "claude-opus-4-8", 0.000005, 0.000025, true)] },
  { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", contextLength: 1_000_000, modality: "text+image->text", supportedParameters: PARAMS,
    endpoints: [ep("anthropic", "claude-sonnet-4-6", 0.000003, 0.000015, true)] },
  { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5", contextLength: 200_000, modality: "text+image->text", supportedParameters: PARAMS,
    endpoints: [ep("anthropic", "claude-haiku-4-5", 0.000001, 0.000005, true)] },
  { id: "openai/gpt-5.2", name: "GPT-5.2", contextLength: 400_000, modality: "text+image->text", supportedParameters: PARAMS,
    endpoints: [ep("openai", "gpt-5.2", 0.000002, 0.00001)] },
  { id: "openai/gpt-5.2-mini", name: "GPT-5.2 Mini", contextLength: 400_000, modality: "text->text", supportedParameters: PARAMS,
    endpoints: [ep("openai", "gpt-5.2-mini", 0.0000004, 0.0000016)] },
  { id: "google/gemini-3-pro", name: "Gemini 3 Pro", contextLength: 2_000_000, modality: "text+image->text", supportedParameters: PARAMS,
    endpoints: [ep("google", "gemini-3-pro", 0.0000012, 0.000005)] },
  { id: "google/gemini-3-flash", name: "Gemini 3 Flash", contextLength: 1_000_000, modality: "text+image->text", supportedParameters: PARAMS,
    endpoints: [ep("google", "gemini-3-flash", 0.0000003, 0.0000012)] },
  // Llama via two providers → demonstrates fallback / price routing
  { id: "meta/llama-4-maverick", name: "Llama 4 Maverick", contextLength: 1_000_000, modality: "text->text", supportedParameters: PARAMS,
    endpoints: [
      ep("deepseek", "llama-4-maverick", 0.0000004, 0.0000016),
      ep("google", "llama-4-maverick", 0.0000005, 0.0000018),
    ] },
  { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2", contextLength: 128_000, modality: "text->text", supportedParameters: PARAMS,
    endpoints: [ep("deepseek", "deepseek-chat", 0.00000027, 0.0000011)] },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", contextLength: 128_000, modality: "text->text", supportedParameters: PARAMS,
    endpoints: [ep("deepseek", "deepseek-reasoner", 0.00000055, 0.00000219)] },
];

const byId = new Map(catalog.map((m) => [m.id, m]));
export const getCatalogModel = (id: string): CatalogModel | undefined => byId.get(id);
