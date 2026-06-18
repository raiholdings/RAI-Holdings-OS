"use client";

import { useSyncExternalStore } from "react";
import { generateVenture, type Venture, type VentureStatus } from "@/lib/workspace";

/* RAI OS Workspace — client state (P1/P2 mock). Multi-tenant: orgs + ventures
   scoped by orgId. localStorage-backed; replace with backend (org JWT + DB). */

export type Org = { id: string; name: string; balanceVnd: number };

type State = { orgs: Org[]; currentOrgId: string; ventures: Venture[]; seq: number };

const KEY = "rai-workspace-v1";
const DEFAULT_ORG: Org = { id: "org-rai", name: "RAI Demo Org", balanceVnd: 2_000_000 };
const EMPTY: State = { orgs: [DEFAULT_ORG], currentOrgId: DEFAULT_ORG.id, ventures: [], seq: 0 };

let state: State = EMPTY;
let hydrated = false;
let _idc = 0;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(next: Partial<State>) { state = { ...state, ...next, seq: state.seq + 1 }; persist(); emit(); }

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = { ...EMPTY, ...JSON.parse(raw) }; emit(); } } catch {}
}

/* ---- mutations ---- */
export function createVenture(idea: string): Venture {
  const id = `v-${state.seq + 1}-${++_idc}`;
  const v = generateVenture(state.currentOrgId, idea.trim(), id, Date.now());
  set({ ventures: [v, ...state.ventures] });
  return v;
}
/** Save a venture assembled from the real 8-agent pipeline (overrides mock defaults). */
export function createVentureFromGraph(idea: string, parts: Partial<Venture>): Venture {
  const id = `v-${state.seq + 1}-${++_idc}`;
  const base = generateVenture(state.currentOrgId, idea.trim(), id, Date.now());
  const v: Venture = { ...base, ...parts, id, orgId: state.currentOrgId, ideaPrompt: idea.trim() };
  if (parts.opportunities?.length) v.confidence = parts.opportunities[0].confidenceScore;
  set({ ventures: [v, ...state.ventures] });
  return v;
}

export function setVentureStatus(id: string, status: VentureStatus) {
  set({ ventures: state.ventures.map((v) => (v.id === id ? { ...v, status } : v)) });
}
export function deleteVenture(id: string) { set({ ventures: state.ventures.filter((v) => v.id !== id) }); }
export function switchOrg(orgId: string) { if (state.orgs.some((o) => o.id === orgId)) set({ currentOrgId: orgId }); }

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
