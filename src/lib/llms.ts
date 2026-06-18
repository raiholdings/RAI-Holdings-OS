// RAI LLMs — unified LLM gateway (OpenRouter-style) catalog & types.
// Phase 1 (mock): catalog is seeded here; the real gateway (llms.raiholdings.vn)
// is self-hosted and replaces the API routes later. No upstream keys here.
import { t, type T } from "@/lib/i18n-core";

export const RAI_LLMS_GATEWAY = "https://llms.raiholdings.vn/api/v1";

export type ProviderKey =
  | "openai" | "anthropic" | "google" | "deepseek" | "qwen" | "meta" | "mistral" | "xai";

export type Endpoint = {
  provider: string;          // display name
  providerKey: ProviderKey;
  pricePrompt: string;       // USD per token (string for precision)
  priceCompletion: string;
  contextLength: number;
  maxCompletion: number;
  throughput: number;        // tok/s
  uptime: number;            // 0..100 (24h)
  status: "operational" | "degraded";
};

export type Model = {
  id: string;                // "anthropic/claude-opus-4.8"
  author: ProviderKey;
  slug: string;
  name: string;
  created: number;
  description: T;
  contextLength: number;
  modality: string;          // "text->text" | "text+image->text"
  inputModalities: string[];
  outputModalities: string[];
  tokenizer: string;
  pricing: { prompt: string; completion: string; image?: string };
  supportedParameters: string[];
  endpoints: Endpoint[];
  tags: string[];            // e.g. ["reasoning","vision","tools"]
  vietnamese?: boolean;      // good at Vietnamese
};

export type Provider = {
  key: ProviderKey;
  name: string;
  dataPolicy: T;             // logging/retention policy summary
  models: number;
};

// ---- providers ------------------------------------------------------------
export const providers: Provider[] = [
  { key: "anthropic", name: "Anthropic", dataPolicy: t("Does not train on API data; configurable retention.", "Không huấn luyện trên dữ liệu API; lưu trữ cấu hình được."), models: 3 },
  { key: "openai", name: "OpenAI", dataPolicy: t("No training on API data by default.", "Mặc định không huấn luyện trên dữ liệu API."), models: 2 },
  { key: "google", name: "Google", dataPolicy: t("Enterprise tier offers no-retention.", "Gói doanh nghiệp có tùy chọn không lưu."), models: 2 },
  { key: "deepseek", name: "DeepSeek", dataPolicy: t("May retain data; check ZDR routing.", "Có thể lưu dữ liệu; cân nhắc route ZDR."), models: 2 },
  { key: "qwen", name: "Alibaba Qwen", dataPolicy: t("Strong multilingual incl. Vietnamese.", "Đa ngữ tốt, gồm tiếng Việt."), models: 1 },
  { key: "meta", name: "Meta", dataPolicy: t("Open weights; hosted by partners.", "Trọng số mở; do đối tác vận hành."), models: 1 },
  { key: "mistral", name: "Mistral", dataPolicy: t("EU-hosted options available.", "Có tùy chọn đặt tại EU."), models: 1 },
  { key: "xai", name: "xAI", dataPolicy: t("Check provider policy.", "Xem chính sách nhà cung cấp."), models: 1 },
];

export const providerName = (k: ProviderKey) => providers.find((p) => p.key === k)?.name ?? k;

// ---- helpers --------------------------------------------------------------
const ep = (
  provider: string, providerKey: ProviderKey, pricePrompt: string, priceCompletion: string,
  contextLength: number, maxCompletion: number, throughput: number, uptime: number,
  status: Endpoint["status"] = "operational",
): Endpoint => ({ provider, providerKey, pricePrompt, priceCompletion, contextLength, maxCompletion, throughput, uptime, status });

// per-token USD; UI renders per 1M.
function mk(
  author: ProviderKey, slug: string, name: string, description: T, contextLength: number,
  prompt: string, completion: string, supportedParameters: string[], tags: string[],
  opts: { vision?: boolean; vietnamese?: boolean; image?: string; created?: number; endpoints?: Endpoint[] } = {},
): Model {
  const modality = opts.vision ? "text+image->text" : "text->text";
  return {
    id: `${author}/${slug}`, author, slug, name, created: opts.created ?? 1_770_000_000, description,
    contextLength, modality,
    inputModalities: opts.vision ? ["text", "image"] : ["text"],
    outputModalities: ["text"],
    tokenizer: author === "anthropic" ? "Claude" : author === "openai" ? "GPT" : "Other",
    pricing: { prompt, completion, ...(opts.image ? { image: opts.image } : {}) },
    supportedParameters, tags, vietnamese: opts.vietnamese,
    endpoints: opts.endpoints ?? [ep(providerName(author), author, prompt, completion, contextLength, Math.min(64000, Math.floor(contextLength / 4)), 80, 99.8)],
  };
}

const PARAMS_FULL = ["tools", "tool_choice", "temperature", "top_p", "top_k", "max_tokens", "stop", "response_format", "seed", "stream"];
const PARAMS_BASIC = ["temperature", "top_p", "max_tokens", "stop", "stream"];

// ---- catalog (reference values for real external models; billed in VND credits) ----
export const models: Model[] = [
  mk("anthropic", "claude-opus-4.8", "Claude Opus 4.8",
    t("Anthropic's most capable model — frontier reasoning, agents and coding.", "Mô hình mạnh nhất của Anthropic — suy luận, agent và lập trình đỉnh cao."),
    1_000_000, "0.000005", "0.000025", PARAMS_FULL, ["reasoning", "tools", "vision", "frontier"], { vision: true, vietnamese: true }),
  mk("anthropic", "claude-sonnet-4.6", "Claude Sonnet 4.6",
    t("Balanced speed and intelligence for production workloads.", "Cân bằng tốc độ và trí tuệ cho khối lượng sản xuất."),
    1_000_000, "0.000003", "0.000015", PARAMS_FULL, ["reasoning", "tools", "vision"], { vision: true, vietnamese: true }),
  mk("anthropic", "claude-haiku-4.5", "Claude Haiku 4.5",
    t("Fast and affordable for high-volume, latency-sensitive tasks.", "Nhanh, rẻ cho tác vụ khối lượng lớn, nhạy độ trễ."),
    200_000, "0.000001", "0.000005", PARAMS_FULL, ["fast", "tools", "vision"], { vision: true }),
  mk("openai", "gpt-5.2", "GPT-5.2",
    t("OpenAI flagship — strong general reasoning and tool use.", "Chủ lực OpenAI — suy luận tổng quát và dùng công cụ mạnh."),
    400_000, "0.000002", "0.00001", PARAMS_FULL, ["reasoning", "tools", "vision"], { vision: true }),
  mk("openai", "gpt-5.2-mini", "GPT-5.2 Mini",
    t("Cheaper, fast variant for everyday tasks.", "Bản rẻ, nhanh cho tác vụ hằng ngày."),
    400_000, "0.0000004", "0.0000016", PARAMS_FULL, ["fast", "tools"], {}),
  mk("google", "gemini-3-pro", "Gemini 3 Pro",
    t("Long-context multimodal model with strong multilingual support.", "Đa phương thức ngữ cảnh dài, hỗ trợ đa ngữ tốt."),
    2_000_000, "0.0000012", "0.000005", PARAMS_FULL, ["reasoning", "tools", "vision", "long-context"], { vision: true, vietnamese: true }),
  mk("google", "gemini-3-flash", "Gemini 3 Flash",
    t("Very fast, low-cost multimodal model.", "Đa phương thức rất nhanh, chi phí thấp."),
    1_000_000, "0.0000003", "0.0000012", PARAMS_FULL, ["fast", "vision", "long-context"], { vision: true, vietnamese: true }),
  mk("deepseek", "deepseek-v3.2", "DeepSeek V3.2",
    t("Open, cost-efficient general model.", "Mô hình tổng quát mở, hiệu quả chi phí."),
    128_000, "0.00000027", "0.0000011", PARAMS_BASIC.concat("tools"), ["tools", "cheap"], {}),
  mk("deepseek", "deepseek-r1", "DeepSeek R1",
    t("Open reasoning model with visible chain-of-thought.", "Mô hình suy luận mở, có chuỗi suy nghĩ hiển thị."),
    128_000, "0.00000055", "0.00000219", PARAMS_BASIC, ["reasoning", "cheap"], {}),
  mk("qwen", "qwen3-max", "Qwen3 Max",
    t("Alibaba's flagship — excellent Vietnamese & Asian languages.", "Chủ lực Alibaba — tiếng Việt & ngôn ngữ châu Á xuất sắc."),
    256_000, "0.0000012", "0.000006", PARAMS_FULL, ["tools", "multilingual"], { vietnamese: true }),
  mk("meta", "llama-4-maverick", "Llama 4 Maverick",
    t("Open-weights model hosted across multiple providers.", "Mô hình trọng số mở, nhiều nhà cung cấp phục vụ."),
    1_000_000, "0.0000005", "0.0000018", PARAMS_BASIC.concat("tools"), ["tools", "open"], { vision: true,
      endpoints: [
        ep("Meta", "meta", "0.0000005", "0.0000018", 1_000_000, 16000, 120, 99.5),
        ep("DeepSeek", "deepseek", "0.0000004", "0.0000016", 1_000_000, 16000, 90, 99.2, "degraded"),
      ] }),
  mk("mistral", "mistral-large-3", "Mistral Large 3",
    t("EU-hosted general model with strong European languages.", "Mô hình tổng quát đặt tại EU, mạnh ngôn ngữ châu Âu."),
    256_000, "0.000002", "0.000006", PARAMS_FULL, ["tools"], {}),
  mk("xai", "grok-4", "Grok 4",
    t("xAI flagship with real-time knowledge options.", "Chủ lực xAI, tùy chọn tri thức thời gian thực."),
    256_000, "0.000003", "0.000015", PARAMS_FULL, ["reasoning", "tools"], {}),
];

// ---- rankings (mock token-usage leaderboard) ------------------------------
export type Ranking = { rank: number; id: string; tokens: string; sharePct: number; trend: "up" | "down" | "flat" };
export const rankings: Ranking[] = [
  { rank: 1, id: "anthropic/claude-sonnet-4.6", tokens: "1.42T", sharePct: 22, trend: "up" },
  { rank: 2, id: "google/gemini-3-flash", tokens: "1.10T", sharePct: 17, trend: "up" },
  { rank: 3, id: "anthropic/claude-opus-4.8", tokens: "0.81T", sharePct: 12, trend: "flat" },
  { rank: 4, id: "openai/gpt-5.2", tokens: "0.74T", sharePct: 11, trend: "down" },
  { rank: 5, id: "deepseek/deepseek-v3.2", tokens: "0.59T", sharePct: 9, trend: "up" },
  { rank: 6, id: "qwen/qwen3-max", tokens: "0.46T", sharePct: 7, trend: "up" },
  { rank: 7, id: "google/gemini-3-pro", tokens: "0.40T", sharePct: 6, trend: "flat" },
  { rank: 8, id: "openai/gpt-5.2-mini", tokens: "0.33T", sharePct: 5, trend: "down" },
];

// ---- queries --------------------------------------------------------------
export const listModels = (): Model[] => models;
export const getModel = (author: string, slug: string): Model | undefined =>
  models.find((m) => m.author === author && m.slug === slug);
export const getModelById = (id: string): Model | undefined => models.find((m) => m.id === id);

export function llmsStats() {
  return {
    models: models.length,
    providers: providers.length,
    vietnamese: models.filter((m) => m.vietnamese).length,
    maxContext: Math.max(...models.map((m) => m.contextLength)),
  };
}

/** USD per-token string → "$X.YZ" per 1M tokens. */
export function perMillion(price: string): string {
  const n = parseFloat(price) * 1_000_000;
  if (!isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}
