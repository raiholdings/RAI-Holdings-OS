"use client";

import type { ListResult, ServerJson } from "@/lib/mcp-registry";

const BASE = "/api/mcp/v0";

export async function fetchServers(params: { limit?: number; cursor?: string; search?: string } = {}): Promise<ListResult> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.search) qs.set("search", params.search);
  const res = await fetch(`${BASE}/servers?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("failed to list servers");
  return res.json();
}

export async function fetchServer(name: string): Promise<ServerJson> {
  const res = await fetch(`${BASE}/servers/${encodeURIComponent(name)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("server not found");
  return res.json();
}

export async function publishServer(server: ServerJson, token: string): Promise<{ ok: boolean; id?: string; errors?: string[] }> {
  const res = await fetch(`${BASE}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(server),
  });
  return res.json();
}

/* ----------------------------- sync (Phase 5) --------------------------- */
export type SyncResult = { fetched: number; imported: number; source: "live" | "fixture"; updatedSince?: string };
export type PendingImport = { server: ServerJson; importedAt: string; upstreamUpdatedAt?: string };

export async function runSync(updatedSince?: string): Promise<SyncResult> {
  const res = await fetch(`${BASE}/sync`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updated_since: updatedSince }) });
  return res.json();
}
export async function fetchPending(): Promise<PendingImport[]> {
  const res = await fetch(`${BASE}/sync`, { cache: "no-store" });
  return (await res.json()).pending ?? [];
}
export async function moderate(name: string, action: "approve" | "reject"): Promise<{ ok: boolean }> {
  const res = await fetch(`${BASE}/sync/moderate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, action }) });
  return res.json();
}

/* ----------------------------- view helpers ----------------------------- */
export const registryMeta = (s: ServerJson) => (s._meta?.["vn.rai.registry/official"] ?? {}) as { id?: string; source?: string; updatedAt?: string; isLatest?: boolean };
export const registryStats = (s: ServerJson) => (s._meta?.["vn.rai.registry/stats"] ?? {}) as { stars?: number; installs?: number };
export const versionsOf = (s: ServerJson) => (s._meta?.["vn.rai.registry/versions"] ?? []) as string[];

export function colorForSource(source?: string): string {
  return source === "rai" ? "#0F2A47" : "#2E75B6";
}
export function initials(title: string): string {
  return title.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
