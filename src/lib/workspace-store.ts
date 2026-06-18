"use client";

import { useSyncExternalStore } from "react";
import { generateVenture, type Venture, type VentureStatus } from "@/lib/workspace";

/* RAI OS Workspace — client state (P1/P2 mock). Multi-tenant: orgs + ventures
   scoped by orgId. localStorage-backed; replace with backend (org JWT + DB). */

export type Role = "owner" | "admin" | "member";
export type Org = { id: string; name: string; balanceVnd: number; role?: Role };

type State = { orgs: Org[]; currentOrgId: string; ventures: Venture[]; seq: number };

const KEY = "rai-workspace-v1";
const DEFAULT_ORG: Org = { id: "org-rai", name: "RAI Demo Org", balanceVnd: 2_000_000 };
const EMPTY: State = { orgs: [DEFAULT_ORG], currentOrgId: DEFAULT_ORG.id, ventures: [], seq: 0 };

let state: State = EMPTY;
let hydrated = false;
let remote = false; // true once the DB-backed bootstrap succeeds → write-through to the API
let _idc = 0;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(next: Partial<State>) { state = { ...state, ...next, seq: state.seq + 1 }; persist(); emit(); }

/** Fire-and-forget write-through to the persistence API (no-op until remote). */
function wt(path: string, init: RequestInit) {
  if (!remote) return;
  fetch(`/api/workspace/v0/${path}`, { headers: { "content-type": "application/json" }, ...init }).catch(() => {});
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = { ...EMPTY, ...JSON.parse(raw) }; emit(); } } catch {}
}

/** Probe the backend; if DB persistence is on, adopt server state and switch to
 *  write-through mode. If off (or it errors), stay on the localStorage store.
 *  Safe to call repeatedly; runs the network sync at most once. */
let syncing = false;
export async function syncRemote() {
  if (remote || syncing || typeof window === "undefined") return;
  syncing = true;
  try {
    const res = await fetch("/api/workspace/v0/bootstrap", { credentials: "include" });
    if (!res.ok) return;
    const j = (await res.json()) as { db?: boolean; orgs?: Org[]; ventures?: Venture[] };
    if (!j.db || !j.orgs?.length) return;
    remote = true;
    const currentOrgId = j.orgs.some((o) => o.id === state.currentOrgId) ? state.currentOrgId : j.orgs[0].id;
    set({ orgs: j.orgs, ventures: j.ventures ?? [], currentOrgId });
  } catch { /* stay local */ }
  finally { syncing = false; }
}

/** Re-pull server state (e.g. after creating an org or inviting a member). No-op when local. */
export async function refreshRemote() {
  if (!remote) return;
  try {
    const res = await fetch("/api/workspace/v0/bootstrap", { credentials: "include" });
    if (!res.ok) return;
    const j = (await res.json()) as { db?: boolean; orgs?: Org[]; ventures?: Venture[] };
    if (!j.db || !j.orgs?.length) return;
    const currentOrgId = j.orgs.some((o) => o.id === state.currentOrgId) ? state.currentOrgId : j.orgs[0].id;
    set({ orgs: j.orgs, ventures: j.ventures ?? [], currentOrgId });
  } catch { /* ignore */ }
}

/** Whether the workspace is backed by the DB (vs localStorage). Not reactive. */
export function isRemote() { return remote; }

/* ---- mutations ---- */
export function createVenture(idea: string): Venture {
  const id = `v-${state.seq + 1}-${++_idc}`;
  const v = generateVenture(state.currentOrgId, idea.trim(), id, Date.now());
  set({ ventures: [v, ...state.ventures] });
  wt("ventures", { method: "POST", body: JSON.stringify({ venture: v }) });
  return v;
}
/** Save a venture assembled from the real 8-agent pipeline (overrides mock defaults). */
export function createVentureFromGraph(idea: string, parts: Partial<Venture>): Venture {
  const id = `v-${state.seq + 1}-${++_idc}`;
  const base = generateVenture(state.currentOrgId, idea.trim(), id, Date.now());
  const v: Venture = { ...base, ...parts, id, orgId: state.currentOrgId, ideaPrompt: idea.trim() };
  if (parts.opportunities?.length) v.confidence = parts.opportunities[0].confidenceScore;
  set({ ventures: [v, ...state.ventures] });
  wt("ventures", { method: "POST", body: JSON.stringify({ venture: v }) });
  return v;
}

export function setVentureStatus(id: string, status: VentureStatus) {
  set({ ventures: state.ventures.map((v) => (v.id === id ? { ...v, status } : v)) });
  wt(`ventures/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}
export function deleteVenture(id: string) {
  set({ ventures: state.ventures.filter((v) => v.id !== id) });
  wt(`ventures/${id}`, { method: "DELETE" });
}
export function switchOrg(orgId: string) { if (state.orgs.some((o) => o.id === orgId)) set({ currentOrgId: orgId }); }

/* ---- wallet / usage ---- */
/** Adjust the current org's balance locally (optimistic; used in local mode and before a remote refresh). */
export function creditLocal(deltaVnd: number) {
  set({ orgs: state.orgs.map((o) => (o.id === state.currentOrgId ? { ...o, balanceVnd: Math.max(0, o.balanceVnd + deltaVnd) } : o)) });
}
/** Record metered usage: optimistic local debit + write-through to the usage API. */
export function recordUsage(e: { product: string; model?: string; units?: number; costVnd?: number }) {
  const cost = Math.max(0, Math.trunc(e.costVnd ?? 0));
  if (cost > 0) creditLocal(-cost);
  wt("usage", { method: "POST", body: JSON.stringify({ orgId: state.currentOrgId, ...e }) });
}

/* ---- hooks (stable slices; filter in components) ---- */
function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector(EMPTY),
  );
}
export const useOrgs = () => useStore((s) => s.orgs);
export const useCurrentOrgId = () => useStore((s) => s.currentOrgId);
export const useCurrentOrg = () => useStore((s) => s.orgs.find((o) => o.id === s.currentOrgId) ?? s.orgs[0]);
export const useAllVentures = () => useStore((s) => s.ventures);
export const useVenture = (id: string) => useStore((s) => s.ventures.find((v) => v.id === id));

/** Read venture synchronously (e.g. right after createVenture) without a hook. */
export function getVenture(id: string): Venture | undefined { return state.ventures.find((v) => v.id === id); }
