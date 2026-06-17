"use client";

import { useSyncExternalStore } from "react";
import { apps, categories, type RaiApp } from "@/lib/apps";
import { t } from "@/lib/i18n-core";

/* ============================================================
   RAI Apps — client state (submissions, connections, usage).
   localStorage-backed pub/sub. In production this is a backend
   (submissions DB, OAuth 2.1 server, usage metering, billing).
   ============================================================ */

export type SubmissionStatus = "draft" | "submitted" | "in_review" | "approved" | "rejected";

export type SubmissionScope = { id: string; label: string };

export type Submission = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "property" | "design" | "workflow";
  mcpEndpoint: string;
  uiResourceUri: string;
  icon: string;
  color: string;
  scopes: SubmissionScope[];
  hasFallback: boolean;
  status: SubmissionStatus;
  reviewerNote: string;
  checklist: { scoped: boolean; visual: boolean; valuable: boolean };
  seq: number;
};

export type Connection = {
  appId: string;
  scopes: string[];
  token: string;
  plan: "free" | "premium";
  seq: number;
};

export type Usage = { total: number; byTool: Record<string, number> };

type State = {
  submissions: Submission[];
  connections: Record<string, Connection>;
  usage: Record<string, Usage>;
  seq: number;
};

const KEY = "rai-apps-state-v1";
const EMPTY: State = { submissions: [], connections: {}, usage: {}, seq: 0 };

let state: State = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function set(next: Partial<State>) {
  state = { ...state, ...next, seq: state.seq + 1 };
  persist();
  emit();
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { state = { ...EMPTY, ...JSON.parse(raw) }; emit(); }
  } catch {}
}

/* ----------------------------- mutations -------------------------------- */
export function addSubmission(s: Omit<Submission, "status" | "reviewerNote" | "checklist" | "seq" | "id">): string {
  const id = "sub-" + (state.seq + 1);
  const sub: Submission = { ...s, id, status: "submitted", reviewerNote: "", checklist: { scoped: false, visual: false, valuable: false }, seq: state.seq + 1 };
  set({ submissions: [sub, ...state.submissions] });
  return id;
}

export function updateSubmission(id: string, patch: Partial<Submission>) {
  set({ submissions: state.submissions.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
}

export function connectApp(appId: string, scopes: string[]) {
  const token = "rai_tok_" + appId + "_" + (state.seq + 1).toString(36);
  const conn: Connection = { appId, scopes, token, plan: "free", seq: state.seq + 1 };
  set({ connections: { ...state.connections, [appId]: conn } });
}

export function disconnectApp(appId: string) {
  const next = { ...state.connections };
  delete next[appId];
  set({ connections: next });
}

export function setPlan(appId: string, plan: "free" | "premium") {
  const c = state.connections[appId];
  if (!c) return;
  set({ connections: { ...state.connections, [appId]: { ...c, plan } } });
}

export function recordUsage(appId: string, tool: string) {
  const u = state.usage[appId] || { total: 0, byTool: {} };
  set({ usage: { ...state.usage, [appId]: { total: u.total + 1, byTool: { ...u.byTool, [tool]: (u.byTool[tool] || 0) + 1 } } } });
}

/* ----------------------------- queries ---------------------------------- */
export function isConnected(appId: string) { return !!state.connections[appId]; }
export function grantedScopes(appId: string): string[] { return state.connections[appId]?.scopes ?? []; }

/* ----------------------------- hooks ------------------------------------ */
function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector(EMPTY),
  );
}

export const useSubmissions = () => useStore((s) => s.submissions);
export const useConnections = () => useStore((s) => s.connections);
export const useUsage = () => useStore((s) => s.usage);
export const useConnection = (appId: string) => useStore((s) => s.connections[appId]);

/* ----------------------------- directory merge -------------------------- */
export function submissionToApp(s: Submission): RaiApp {
  const tagline = s.tagline || s.name;
  return {
    id: s.id,
    name: s.name,
    tagline: t(tagline, tagline),
    description: t(s.description, s.description),
    category: s.category,
    categoryLabel: categories.find((c) => c.id === s.category)?.label ?? t(s.category, s.category),
    icon: s.icon,
    color: s.color,
    developer: "Community",
    featured: false,
    uiResourceUri: s.uiResourceUri,
    tools: [],
    scopes: s.scopes.map((x) => ({ id: x.id, label: t(x.label, x.label) })),
    mcpEndpoint: s.mcpEndpoint,
    community: true,
  };
}

/** Built-in apps + approved community submissions. */
export function useDirectoryApps(): RaiApp[] {
  const subs = useSubmissions();
  return [...apps, ...subs.filter((s) => s.status === "approved").map(submissionToApp)];
}

/* ----------------------------- validation (Phase 4) --------------------- */
export type Check = { id: string; ok: boolean };
export function validateSubmission(s: {
  name: string; description: string; mcpEndpoint: string; uiResourceUri: string; scopes: SubmissionScope[]; hasFallback: boolean;
}): Check[] {
  return [
    { id: "meta", ok: s.name.trim().length >= 2 && s.description.trim().length >= 20 },
    { id: "endpoint", ok: /^https?:\/\/.+\/mcp$/.test(s.mcpEndpoint.trim()) },
    { id: "ui", ok: /^ui:\/\/.+/.test(s.uiResourceUri.trim()) },
    { id: "fallback", ok: s.hasFallback },
    { id: "scopes", ok: s.scopes.length >= 1 },
  ];
}
