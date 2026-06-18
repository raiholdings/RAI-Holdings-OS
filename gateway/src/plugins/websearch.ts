import { config } from "../config.js";

/** Web search via Tavily. Returns a compact context block, or "" if unconfigured. */
export async function webSearch(query: string, maxResults = 5): Promise<string> {
  if (!config.search.apiKey || !query.trim()) return "";
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ api_key: config.search.apiKey, query, max_results: maxResults, search_depth: "basic" }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return "";
    const json = (await res.json()) as { results?: { title: string; url: string; content: string }[]; answer?: string };
    const lines = (json.results ?? []).map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${(r.content || "").slice(0, 500)}`);
    const head = json.answer ? `Summary: ${json.answer}\n\n` : "";
    return lines.length ? `${head}${lines.join("\n\n")}` : head;
  } catch {
    return "";
  }
}
