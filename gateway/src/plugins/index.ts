import type { NormalizedRequest, Plugin } from "../types.js";
import { webSearch } from "./websearch.js";
import { parseFiles } from "./fileparser.js";

function lastUserText(n: NormalizedRequest): string {
  const m = [...n.messages].reverse().find((x) => x.role === "user");
  if (!m) return "";
  return typeof m.content === "string" ? m.content : m.content.map((p) => (p.type === "text" ? p.text : "")).join(" ");
}

function prependContext(n: NormalizedRequest, label: string, body: string) {
  if (!body.trim()) return;
  const block = `<${label}>\n${body}\n</${label}>`;
  n.system = n.system ? `${block}\n\n${n.system}` : block;
}

/**
 * Run requested plugins, augmenting the normalized request's system context.
 * Supported ids: "web" / "web-search" (Tavily), "file-parser" (urls[]).
 */
export async function applyPlugins(n: NormalizedRequest, plugins?: Plugin[]): Promise<void> {
  if (!plugins?.length) return;
  for (const p of plugins) {
    if (p.enabled === false) continue;
    const id = (p.id || "").toLowerCase();
    if (id === "web" || id === "web-search") {
      const q = typeof p.query === "string" ? p.query : lastUserText(n);
      prependContext(n, "web_search_results", await webSearch(q, typeof p.max_results === "number" ? p.max_results : 5));
    } else if (id === "file-parser" || id === "file") {
      const urls = Array.isArray(p.urls) ? (p.urls as string[]) : [];
      prependContext(n, "attached_documents", await parseFiles(urls));
    }
  }
}
