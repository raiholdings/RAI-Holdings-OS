/**
 * Phase 5 — sync from the official MCP Registry.
 * Pulls servers updated since a timestamp from registry.modelcontextprotocol.io
 * and queues them for manual review. If the upstream is unreachable (preview /
 * offline), falls back to a bundled fixture so the flow is always demonstrable.
 */
import { importFromUpstream, SCHEMA_URL, type ServerJson } from "@/lib/mcp-registry";

const OFFICIAL = "https://registry.modelcontextprotocol.io/v0/servers";

type UpstreamItem = Partial<ServerJson> & { server?: Partial<ServerJson> };

function normalize(item: UpstreamItem): ServerJson | null {
  const s = (item.server ?? item) as Partial<ServerJson>;
  if (!s.name) return null;
  return {
    $schema: s.$schema || SCHEMA_URL,
    name: s.name,
    title: s.title || s.name.split("/").slice(1).join("/"),
    description: s.description || "",
    version: s.version || "latest",
    websiteUrl: s.websiteUrl,
    repository: s.repository,
    packages: s.packages,
    remotes: s.remotes,
  };
}

const FIXTURE: ServerJson[] = [
  { $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/memory", title: "Memory", description: "Knowledge-graph-based persistent memory.", version: "2025.3.28", repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@modelcontextprotocol/server-memory", version: "2025.3.28", transport: { type: "stdio" } }] },
  { $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/sequential-thinking", title: "Sequential Thinking", description: "Dynamic problem-solving through thought sequences.", version: "2025.3.28", repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@modelcontextprotocol/server-sequential-thinking", version: "2025.3.28", transport: { type: "stdio" } }] },
  { $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/fetch", title: "Fetch", description: "Web content fetching and conversion for LLM usage.", version: "2025.3.28", repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, packages: [{ registryType: "pypi", registryBaseUrl: "https://pypi.org", identifier: "mcp-server-fetch", version: "2025.3.28", transport: { type: "stdio" } }] },
  { $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/time", title: "Time", description: "Time and timezone conversion utilities.", version: "2025.3.28", repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, packages: [{ registryType: "pypi", registryBaseUrl: "https://pypi.org", identifier: "mcp-server-time", version: "2025.3.28", transport: { type: "stdio" } }] },
  { $schema: SCHEMA_URL, name: "io.github.sentry/mcp", title: "Sentry", description: "Retrieve and analyze issues from Sentry.", version: "0.4.0", repository: { url: "https://github.com/getsentry/sentry-mcp", source: "github" }, remotes: [{ type: "streamable-http", url: "https://mcp.sentry.dev/mcp" }] },
];

export type SyncResult = { fetched: number; imported: number; source: "live" | "fixture"; updatedSince?: string };

export async function syncUpstream(
  updatedSince?: string,
  importer: (servers: ServerJson[], updatedSince?: string) => number | Promise<number> = importFromUpstream,
): Promise<SyncResult> {
  let items: UpstreamItem[] = [];
  let source: "live" | "fixture" = "live";
  try {
    const qs = new URLSearchParams({ limit: "30" });
    if (updatedSince) qs.set("updated_since", updatedSince);
    const res = await fetch(`${OFFICIAL}?${qs}`, { signal: AbortSignal.timeout(5000), headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("upstream " + res.status);
    const data = await res.json();
    items = (data.servers ?? data ?? []) as UpstreamItem[];
    if (!Array.isArray(items) || items.length === 0) throw new Error("empty upstream");
  } catch {
    items = FIXTURE as UpstreamItem[];
    source = "fixture";
  }
  const servers = items.map(normalize).filter((s): s is ServerJson => !!s);
  const imported = await importer(servers, updatedSince);
  return { fetched: servers.length, imported, source, updatedSince };
}
