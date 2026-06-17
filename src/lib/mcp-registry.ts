/**
 * RAI MCP Registry — data layer (Official MCP Registry API + server.json schema).
 *
 * Faithful to the `server.json` schema (2025-12-11) and the Generic Registry API.
 * In-memory seed here; in production this is PostgreSQL (see SPEC_MCP §7) behind
 * the same /api/mcp/v0 surface. A metaregistry stores METADATA only — never code.
 */

export const SCHEMA_URL = "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json";

export type EnvVar = { name: string; description?: string; isRequired?: boolean; isSecret?: boolean };
export type PackageTransport = { type: "stdio" | "sse" | "streamable-http" };
export type Package = {
  registryType: "npm" | "pypi" | "oci";
  registryBaseUrl?: string;
  identifier: string;
  version: string;
  transport: PackageTransport;
  environmentVariables?: EnvVar[];
};
export type Remote = { type: "sse" | "streamable-http"; url: string; headers?: EnvVar[] };
export type Repository = { url: string; source: string };

export type ServerJson = {
  $schema?: string;
  name: string; // e.g. "vn.rai/property-search"
  title: string;
  description: string;
  websiteUrl?: string;
  repository?: Repository;
  version: string;
  packages?: Package[];
  remotes?: Remote[];
  _meta?: Record<string, unknown>;
};

/** Registry-side record wrapping all versions + curation metadata. */
export type RegistryEntry = {
  id: string;
  name: string;
  versions: ServerJson[]; // newest first
  stars: number;
  installs: number;
  publishedAt: string; // RFC3339
  updatedAt: string; // RFC3339
  status: "active" | "deprecated";
  source: "rai" | "community";
};

export const namespaceOf = (name: string) => name.split("/")[0];
export const shortNameOf = (name: string) => name.split("/").slice(1).join("/");

/* ----------------------------- seed ------------------------------------- */
function entry(e: Omit<RegistryEntry, "versions"> & { server: ServerJson }): RegistryEntry {
  const { server, ...rest } = e;
  return { ...rest, versions: [server] };
}

const SEED: RegistryEntry[] = [
  entry({
    id: "rai-0001", name: "vn.rai/property-search", stars: 1243, installs: 1243, publishedAt: "2026-03-02T09:00:00Z", updatedAt: "2026-05-20T09:00:00Z", status: "active", source: "rai",
    server: {
      $schema: SCHEMA_URL, name: "vn.rai/property-search", title: "RAI Property Search",
      description: "Tìm kiếm bất động sản NOXH/shophouse từ dữ liệu BDSG Land & Minh Phát Land.",
      websiteUrl: "https://raiholdings.vn", repository: { url: "https://github.com/rai/property-mcp", source: "github" }, version: "1.0.0",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@rai/property-mcp", version: "1.0.0", transport: { type: "stdio" }, environmentVariables: [{ name: "RAI_API_KEY", description: "Khóa API nội bộ RAI", isRequired: true, isSecret: true }] }],
      remotes: [{ type: "sse", url: "https://mcp.eurowindowlightcity.net/property/sse" }],
      _meta: { "vn.rai.registry/publisher-provided": { tool: "rai-publisher", version: "1.0.0" } },
    },
  }),
  entry({
    id: "rai-0002", name: "vn.rai/designer", stars: 642, installs: 642, publishedAt: "2026-03-10T09:00:00Z", updatedAt: "2026-05-12T09:00:00Z", status: "active", source: "rai",
    server: {
      $schema: SCHEMA_URL, name: "vn.rai/designer", title: "RAI Designer",
      description: "Sinh layout & xuất ảnh thiết kế bằng AI cho team marketing và BĐS.",
      websiteUrl: "https://raiholdings.vn", repository: { url: "https://github.com/rai/designer-mcp", source: "github" }, version: "1.1.0",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@rai/designer-mcp", version: "1.1.0", transport: { type: "stdio" }, environmentVariables: [{ name: "RAI_API_KEY", description: "Khóa API nội bộ RAI", isRequired: true, isSecret: true }] }],
      remotes: [{ type: "streamable-http", url: "https://mcp.raiholdings.vn/designer/mcp" }],
    },
  }),
  entry({
    id: "rai-0003", name: "vn.rai/workflow", stars: 511, installs: 511, publishedAt: "2026-03-18T09:00:00Z", updatedAt: "2026-06-01T09:00:00Z", status: "active", source: "rai",
    server: {
      $schema: SCHEMA_URL, name: "vn.rai/workflow", title: "RAI Workflow (n8n)",
      description: "Kích hoạt và theo dõi automation n8n bằng ngôn ngữ tự nhiên.",
      websiteUrl: "https://raiholdings.vn", repository: { url: "https://github.com/rai/workflow-mcp", source: "github" }, version: "0.9.0",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@rai/workflow-mcp", version: "0.9.0", transport: { type: "stdio" }, environmentVariables: [{ name: "N8N_BASE_URL", description: "URL n8n nội bộ", isRequired: true }, { name: "N8N_API_KEY", description: "API key n8n", isRequired: true, isSecret: true }] }],
      remotes: [{ type: "sse", url: "https://mcp.raiholdings.vn/workflow/sse" }],
    },
  }),
  entry({
    id: "io-0001", name: "io.github.modelcontextprotocol/filesystem", stars: 12400, installs: 12400, publishedAt: "2025-09-08T00:00:00Z", updatedAt: "2026-04-02T00:00:00Z", status: "active", source: "community",
    server: {
      $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/filesystem", title: "Filesystem",
      description: "Secure file operations with configurable access controls.",
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, version: "2025.3.28",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@modelcontextprotocol/server-filesystem", version: "2025.3.28", transport: { type: "stdio" } }],
    },
  }),
  entry({
    id: "io-0002", name: "io.github.modelcontextprotocol/github", stars: 9800, installs: 9800, publishedAt: "2025-09-08T00:00:00Z", updatedAt: "2026-03-15T00:00:00Z", status: "active", source: "community",
    server: {
      $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/github", title: "GitHub",
      description: "Manage repositories, issues, and pull requests via the GitHub API.",
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, version: "2025.3.28",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@modelcontextprotocol/server-github", version: "2025.3.28", transport: { type: "stdio" }, environmentVariables: [{ name: "GITHUB_PERSONAL_ACCESS_TOKEN", description: "GitHub PAT", isRequired: true, isSecret: true }] }],
    },
  }),
  entry({
    id: "io-0003", name: "io.github.modelcontextprotocol/postgres", stars: 7200, installs: 7200, publishedAt: "2025-09-08T00:00:00Z", updatedAt: "2026-02-20T00:00:00Z", status: "active", source: "community",
    server: {
      $schema: SCHEMA_URL, name: "io.github.modelcontextprotocol/postgres", title: "PostgreSQL",
      description: "Read-only database access with schema inspection.",
      repository: { url: "https://github.com/modelcontextprotocol/servers", source: "github" }, version: "2025.3.28",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@modelcontextprotocol/server-postgres", version: "2025.3.28", transport: { type: "stdio" }, environmentVariables: [{ name: "DATABASE_URL", description: "PostgreSQL connection string", isRequired: true, isSecret: true }] }],
    },
  }),
  entry({
    id: "io-0004", name: "io.github.brave/search", stars: 5400, installs: 5400, publishedAt: "2025-10-01T00:00:00Z", updatedAt: "2026-01-10T00:00:00Z", status: "active", source: "community",
    server: {
      $schema: SCHEMA_URL, name: "io.github.brave/search", title: "Brave Search",
      description: "Web and local search using the Brave Search API.",
      repository: { url: "https://github.com/brave/brave-search-mcp", source: "github" }, version: "0.6.2",
      packages: [{ registryType: "npm", registryBaseUrl: "https://registry.npmjs.org", identifier: "@brave/brave-search-mcp", version: "0.6.2", transport: { type: "stdio" }, environmentVariables: [{ name: "BRAVE_API_KEY", description: "Brave Search API key", isRequired: true, isSecret: true }] }],
    },
  }),
  entry({
    id: "io-0005", name: "io.github.slack/mcp", stars: 4100, installs: 4100, publishedAt: "2025-10-12T00:00:00Z", updatedAt: "2026-03-01T00:00:00Z", status: "active", source: "community",
    server: {
      $schema: SCHEMA_URL, name: "io.github.slack/mcp", title: "Slack",
      description: "Send messages and manage channels in a Slack workspace.",
      repository: { url: "https://github.com/slack/mcp", source: "github" }, version: "1.2.0",
      remotes: [{ type: "streamable-http", url: "https://slack-mcp.example.com/mcp", headers: [{ name: "Authorization", description: "Bearer token", isRequired: true, isSecret: true }] }],
    },
  }),
];

/* ----------------------------- mutable store ---------------------------- */
// Module-level (resets per server instance). Production: PostgreSQL.
const store: RegistryEntry[] = [...SEED];

/* ----------------------------- API helpers ------------------------------ */
export function toApiServer(e: RegistryEntry, version?: string): ServerJson {
  const v = version && version !== "latest" ? e.versions.find((x) => x.version === version) : e.versions[0];
  const server = v ?? e.versions[0];
  return {
    ...server,
    _meta: {
      ...(server._meta || {}),
      "vn.rai.registry/official": {
        id: e.id, publishedAt: e.publishedAt, updatedAt: e.updatedAt, isLatest: server === e.versions[0], status: e.status, source: e.source,
      },
      "vn.rai.registry/stats": { stars: e.stars, installs: e.installs },
    },
  };
}

export type ListParams = { limit?: number; cursor?: string; search?: string; updated_since?: string };
export type ListResult = { servers: ServerJson[]; metadata: { count: number; next_cursor?: string } };

export function listServers(params: ListParams): ListResult {
  const limit = Math.min(Math.max(params.limit ?? 12, 1), 100);
  let rows = [...store];
  if (params.search) {
    const q = params.search.toLowerCase();
    rows = rows.filter((e) => {
      const s = e.versions[0];
      return (s.name + " " + s.title + " " + s.description).toLowerCase().includes(q);
    });
  }
  if (params.updated_since) {
    const since = Date.parse(params.updated_since);
    if (!Number.isNaN(since)) rows = rows.filter((e) => Date.parse(e.updatedAt) > since);
  }
  rows.sort((a, b) => b.installs - a.installs);
  const start = params.cursor ? decodeCursor(params.cursor) : 0;
  const page = rows.slice(start, start + limit);
  const nextStart = start + limit;
  return {
    servers: page.map((e) => toApiServer(e)),
    metadata: { count: rows.length, next_cursor: nextStart < rows.length ? encodeCursor(nextStart) : undefined },
  };
}

export function getEntryById(id: string): RegistryEntry | undefined {
  return store.find((e) => e.id === id);
}
export function getEntryByName(name: string): RegistryEntry | undefined {
  return store.find((e) => e.name === name);
}

function encodeCursor(n: number): string {
  return Buffer.from(String(n)).toString("base64url");
}
function decodeCursor(c: string): number {
  try { const n = parseInt(Buffer.from(c, "base64url").toString(), 10); return Number.isFinite(n) ? n : 0; } catch { return 0; }
}

/* ----------------------------- publish (Phase 4) ------------------------ */
export type PublishResult = { ok: boolean; id?: string; errors?: string[] };

export function validateServer(s: Partial<ServerJson>): string[] {
  const errors: string[] = [];
  if (!s.name || !/^[a-z0-9.-]+\/[a-z0-9._-]+$/i.test(s.name)) errors.push("name must be 'namespace/short-name'");
  if (!s.title || s.title.trim().length < 2) errors.push("title is required");
  if (!s.description || s.description.trim().length < 10) errors.push("description must be ≥10 chars");
  if (!s.version) errors.push("version is required");
  const hasPkg = (s.packages?.length ?? 0) > 0;
  const hasRemote = (s.remotes?.length ?? 0) > 0;
  if (!hasPkg && !hasRemote) errors.push("at least one package or remote is required");
  // namespace policy: vn.rai/* remotes must be on a RAI domain
  if (s.name?.startsWith("vn.rai/")) {
    const bad = (s.remotes ?? []).some((r) => !/(^https:\/\/[^/]*\.?(raiholdings\.vn|eurowindowlightcity\.net))/i.test(r.url));
    if (bad) errors.push("vn.rai/* remotes must be on a RAI domain (raiholdings.vn / eurowindowlightcity.net)");
  }
  return errors;
}

/** Simulates namespace auth (OAuth + DNS TXT Ed25519 for vn.rai/*; GitHub for io.github/*). */
export function authorizeNamespace(name: string, token: string | null): { ok: boolean; reason?: string } {
  const ns = namespaceOf(name);
  if (ns === "vn.rai") {
    if (!token || !token.startsWith("rai_")) return { ok: false, reason: "vn.rai/* requires a RAI OAuth token + verified DNS TXT (v=MCPv1; k=ed25519; …)" };
    return { ok: true };
  }
  if (ns.startsWith("io.github.")) {
    if (!token || !token.startsWith("ghp_")) return { ok: false, reason: "io.github.* requires GitHub authentication" };
    return { ok: true };
  }
  return { ok: false, reason: `unsupported namespace '${ns}'` };
}

export function publishServer(server: ServerJson, token: string | null): PublishResult {
  const errors = validateServer(server);
  if (errors.length) return { ok: false, errors };
  const auth = authorizeNamespace(server.name, token);
  if (!auth.ok) return { ok: false, errors: [auth.reason!] };

  const now = new Date().toISOString();
  const existing = getEntryByName(server.name);
  const normalized: ServerJson = { ...server, $schema: server.$schema || SCHEMA_URL };
  if (existing) {
    existing.versions = [normalized, ...existing.versions.filter((v) => v.version !== server.version)];
    existing.updatedAt = now;
    return { ok: true, id: existing.id };
  }
  const id = (server.name.startsWith("vn.rai/") ? "rai-" : "io-") + (1000 + store.length);
  store.unshift({
    id, name: server.name, versions: [normalized], stars: 0, installs: 0, publishedAt: now, updatedAt: now,
    status: "active", source: server.name.startsWith("vn.rai/") ? "rai" : "community",
  });
  return { ok: true, id };
}

export function totalCount(): number { return store.length; }

/* ----------------------------- upstream import + moderation (Phase 5) --- */
// Imported community servers wait for manual review before going live
// (policy: only vn.rai/* auto-publishes; imports need human approval).
export type PendingImport = { server: ServerJson; importedAt: string; upstreamUpdatedAt?: string };
const pending: PendingImport[] = [];

export function listPending(): PendingImport[] {
  return pending;
}

export function importFromUpstream(servers: ServerJson[], upstreamUpdatedAt?: string): number {
  let n = 0;
  const now = new Date().toISOString();
  for (const s of servers) {
    if (!s?.name) continue;
    if (getEntryByName(s.name)) continue; // already in registry
    if (pending.find((p) => p.server.name === s.name)) continue; // already queued
    pending.push({ server: { ...s, $schema: s.$schema || SCHEMA_URL }, importedAt: now, upstreamUpdatedAt });
    n += 1;
  }
  return n;
}

export function approveImport(name: string): boolean {
  const i = pending.findIndex((p) => p.server.name === name);
  if (i < 0) return false;
  const p = pending[i];
  pending.splice(i, 1);
  const now = new Date().toISOString();
  store.unshift({
    id: "io-" + (2000 + store.length), name: p.server.name, versions: [p.server], stars: 0, installs: 0,
    publishedAt: p.upstreamUpdatedAt || now, updatedAt: now, status: "active", source: "community",
  });
  return true;
}

export function rejectImport(name: string): boolean {
  const i = pending.findIndex((p) => p.server.name === name);
  if (i < 0) return false;
  pending.splice(i, 1);
  return true;
}
