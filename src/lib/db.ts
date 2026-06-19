// Supabase / PostgREST adapter — SERVER ONLY (uses the service_role key).
//
// Works on Cloudflare Workers because it talks to PostgREST over fetch (no TCP
// driver). Env is read inside functions — on Workers, process.env is only
// populated during a request, not at module load.
//
// Disabled (no SUPABASE_URL / service role) → dbEnabled() === false, and the
// workspace API routes fall back to telling the client to use localStorage.
// The service role key must be a Secret on the Worker — never sent to the browser.
// Server-only: imported solely by /api/workspace/v0/* route handlers, never by
// client code (which talks to those routes over fetch).

function cfg() {
  const url = (process.env.SUPABASE_URL || process.env.SUPABASE_PUBLIC_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE || process.env.SERVICE_ROLE_KEY || "";
  const schema = process.env.SUPABASE_SCHEMA || "workspace";
  return { url, key, schema };
}

export function dbEnabled(): boolean {
  const { url, key } = cfg();
  return Boolean(url && key);
}

type Row = Record<string, unknown>;

async function rest(path: string, init: RequestInit & { write?: boolean; schema?: string } = {}): Promise<Response> {
  const { url, key, schema: defSchema } = cfg();
  const schema = init.schema || defSchema;
  if (!url || !key) throw new Error("db_disabled");
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    // PostgREST schema selection (read vs write use different headers).
    ...(init.write ? { "Content-Profile": schema } : { "Accept-Profile": schema }),
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`pgrst_${res.status}:${body.slice(0, 200)}`);
  }
  return res;
}

/** SELECT — `query` is a raw PostgREST query string, e.g. "org_id=eq.x&order=created_at.desc". */
export async function dbSelect<T = Row>(table: string, query = "", schema?: string): Promise<T[]> {
  const res = await rest(`${table}${query ? `?${query}` : ""}`, { schema });
  return (await res.json()) as T[];
}

/** INSERT one or more rows; returns the inserted representation. */
export async function dbInsert<T = Row>(table: string, rows: Row | Row[], schema?: string): Promise<T[]> {
  const res = await rest(table, {
    method: "POST",
    write: true,
    schema,
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(rows),
  });
  return (await res.json()) as T[];
}

/** UPDATE rows matching `query`; returns the updated representation. */
export async function dbUpdate<T = Row>(table: string, query: string, patch: Row, schema?: string): Promise<T[]> {
  const res = await rest(`${table}?${query}`, {
    method: "PATCH",
    write: true,
    schema,
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  return (await res.json()) as T[];
}

/** UPSERT (insert on conflict do update). `onConflict` = comma-separated key cols. */
export async function dbUpsert<T = Row>(table: string, rows: Row | Row[], onConflict: string, schema?: string): Promise<T[]> {
  const res = await rest(`${table}?on_conflict=${onConflict}`, {
    method: "POST",
    write: true,
    schema,
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(rows),
  });
  return (await res.json()) as T[];
}

/** DELETE rows matching `query`. */
export async function dbDelete(table: string, query: string, schema?: string): Promise<void> {
  await rest(`${table}?${query}`, { method: "DELETE", write: true, schema });
}

/** Call a Postgres function via PostgREST RPC; returns its result. */
export async function dbRpc<T = unknown>(fn: string, args: Row, schema?: string): Promise<T> {
  const res = await rest(`rpc/${fn}`, { method: "POST", write: true, schema, body: JSON.stringify(args) });
  return (await res.json()) as T;
}
