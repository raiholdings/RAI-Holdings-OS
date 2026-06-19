// MCP registry — DB-backed read+write (single source of truth). SERVER ONLY.
// mcp.servers.data = RegistryEntry (canonical); scalar status overrides data.status
// (so admin status edits reflect publicly). mcp.pending_imports = sync queue.
import { dbSelect, dbUpsert, dbInsert, dbDelete } from "@/lib/db";
import {
  filterEntries, validateServer, authorizeNamespace, namespaceOf, SCHEMA_URL,
  type RegistryEntry, type ServerJson, type ListParams, type ListResult, type PublishResult, type PendingImport,
} from "@/lib/mcp-registry";

const enc = (v: string) => encodeURIComponent(v);
type Row = { id: string; data: RegistryEntry; status?: string };
type PRow = { name: string; data: ServerJson; upstream_updated_at?: string | null; created_at: string };

async function allEntriesDb(): Promise<RegistryEntry[]> {
  const rows = await dbSelect<Row>("servers", "select=id,data,status", "mcp");
  return rows.map((r) => ({ ...r.data, status: (r.status as RegistryEntry["status"]) ?? r.data.status }));
}

function rowFor(entry: RegistryEntry) {
  return { id: entry.id, name: entry.name, namespace: namespaceOf(entry.name), status: entry.status, source: entry.source, data: entry, updated_at: new Date().toISOString() };
}

export async function dbListServers(params: ListParams): Promise<ListResult> {
  return filterEntries(await allEntriesDb(), params);
}

export async function dbGetEntry(idOrName: string): Promise<RegistryEntry | undefined> {
  let rows = await dbSelect<Row>("servers", `id=eq.${enc(idOrName)}&select=id,data,status&limit=1`, "mcp");
  if (!rows[0]) rows = await dbSelect<Row>("servers", `name=eq.${enc(idOrName)}&select=id,data,status&limit=1`, "mcp");
  const r = rows[0];
  return r ? { ...r.data, status: (r.status as RegistryEntry["status"]) ?? r.data.status } : undefined;
}

export async function dbPublish(server: ServerJson, token: string | null): Promise<PublishResult> {
  const errors = validateServer(server);
  if (errors.length) return { ok: false, errors };
  const auth = authorizeNamespace(server.name, token);
  if (!auth.ok) return { ok: false, errors: [auth.reason!] };

  const now = new Date().toISOString();
  const normalized: ServerJson = { ...server, $schema: server.$schema || SCHEMA_URL };
  const existing = await dbGetEntry(server.name);
  if (existing) {
    const versions = [normalized, ...existing.versions.filter((v) => v.version !== server.version)];
    await dbUpsert("servers", rowFor({ ...existing, versions, updatedAt: now }), "id", "mcp");
    return { ok: true, id: existing.id };
  }
  const count = (await dbSelect("servers", "select=id", "mcp")).length;
  const id = (server.name.startsWith("vn.rai/") ? "rai-" : "io-") + (1000 + count);
  const entry: RegistryEntry = { id, name: server.name, versions: [normalized], stars: 0, installs: 0, publishedAt: now, updatedAt: now, status: "active", source: server.name.startsWith("vn.rai/") ? "rai" : "community" };
  await dbUpsert("servers", rowFor(entry), "id", "mcp");
  return { ok: true, id };
}

export async function dbListPending(): Promise<PendingImport[]> {
  const rows = await dbSelect<PRow>("pending_imports", "select=*&order=created_at.desc", "mcp");
  return rows.map((r) => ({ server: r.data, importedAt: r.created_at, upstreamUpdatedAt: r.upstream_updated_at ?? undefined }));
}

export async function dbImport(servers: ServerJson[], upstreamUpdatedAt?: string): Promise<number> {
  let n = 0;
  for (const s of servers) {
    if (!s?.name) continue;
    if (await dbGetEntry(s.name)) continue;
    const ex = await dbSelect("pending_imports", `name=eq.${enc(s.name)}&select=name&limit=1`, "mcp");
    if (ex.length) continue;
    await dbInsert("pending_imports", [{ name: s.name, data: { ...s, $schema: s.$schema || SCHEMA_URL }, upstream_updated_at: upstreamUpdatedAt ?? null }], "mcp");
    n += 1;
  }
  return n;
}

export async function dbApprove(name: string): Promise<boolean> {
  const rows = await dbSelect<PRow>("pending_imports", `name=eq.${enc(name)}&select=*&limit=1`, "mcp");
  const p = rows[0];
  if (!p) return false;
  const count = (await dbSelect("servers", "select=id", "mcp")).length;
  const now = new Date().toISOString();
  const entry: RegistryEntry = { id: "io-" + (2000 + count), name: p.name, versions: [p.data], stars: 0, installs: 0, publishedAt: p.upstream_updated_at || now, updatedAt: now, status: "active", source: "community" };
  await dbUpsert("servers", rowFor(entry), "id", "mcp");
  await dbDelete("pending_imports", `name=eq.${enc(name)}`, "mcp");
  return true;
}

export async function dbReject(name: string): Promise<boolean> {
  await dbDelete("pending_imports", `name=eq.${enc(name)}`, "mcp");
  return true;
}
