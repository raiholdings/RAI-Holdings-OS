"use client";

import { useSyncExternalStore } from "react";

/* ============================================================
   RAI LLMs — client state (Phase 4 UI, mocked).
   API keys, VND credit wallet, activity log, presets.
   localStorage-backed. In production this is the gateway backend
   (api_keys, wallets, transactions, requests_log, presets).
   ============================================================ */

export const FX_USD_VND = 25_400; // demo conversion rate

export type ApiKey = { id: string; label: string; key: string; createdAt: number; used: number; disabled: boolean };
export type Txn = { id: string; type: "topup" | "debit"; vnd: number; ref: string; ts: number };
export type Activity = {
  id: string; ts: number; model: string; provider: string;
  promptTokens: number; completionTokens: number; costUsd: number; costVnd: number; finishReason: string;
};
export type Preset = { id: string; name: string; model: string; system: string; sort: "price" | "throughput" | "latency" };

type State = {
  keys: ApiKey[];
  balanceVnd: number;
  transactions: Txn[];
  activity: Activity[];
  presets: Preset[];
  seq: number;
};

const KEY = "rai-llms-v1";
const EMPTY: State = { keys: [], balanceVnd: 500_000, transactions: [], activity: [], presets: [], seq: 0 };

let state: State = EMPTY;
let hydrated = false;
let _idc = 0;
const listeners = new Set<() => void>();

function emit() { listeners.forEach((l) => l()); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(next: Partial<State>) { state = { ...state, ...next, seq: state.seq + 1 }; persist(); emit(); }
function nid(p: string) { return `${p}-${state.seq + 1}-${++_idc}`; }

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = { ...EMPTY, ...JSON.parse(raw) }; emit(); } } catch {}
}

/* ----------------------------- mutations -------------------------------- */
export function createKey(label: string): ApiKey {
  const rand = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8);
  const k: ApiKey = { id: nid("key"), label: label.trim() || "Untitled key", key: `rai-sk-${rand}`, createdAt: Date.now(), used: 0, disabled: false };
  set({ keys: [k, ...state.keys] });
  return k;
}
export function revokeKey(id: string) { set({ keys: state.keys.filter((k) => k.id !== id) }); }

export function topUp(vnd: number) {
  if (vnd <= 0) return;
  const txn: Txn = { id: nid("txn"), type: "topup", vnd, ref: "demo-topup", ts: Date.now() };
  set({ balanceVnd: state.balanceVnd + vnd, transactions: [txn, ...state.transactions] });
}

/** Log a completed chat: record activity + debit credits (VND). */
export function logChat(a: Omit<Activity, "id" | "ts" | "costVnd">) {
  const costVnd = Math.round(a.costUsd * FX_USD_VND);
  const row: Activity = { ...a, id: nid("gen"), ts: Date.now(), costVnd };
  const txn: Txn = { id: nid("txn"), type: "debit", vnd: costVnd, ref: a.model, ts: Date.now() };
  set({
    activity: [row, ...state.activity].slice(0, 200),
    transactions: costVnd > 0 ? [txn, ...state.transactions] : state.transactions,
    balanceVnd: Math.max(0, state.balanceVnd - costVnd),
  });
}

export function savePreset(p: Omit<Preset, "id">): Preset {
  const preset: Preset = { ...p, id: nid("preset") };
  set({ presets: [preset, ...state.presets] });
  return preset;
}
export function deletePreset(id: string) { set({ presets: state.presets.filter((p) => p.id !== id) }); }

/* ----------------------------- hooks ------------------------------------ */
function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector(EMPTY),
  );
}
export const useKeys = () => useStore((s) => s.keys);
export const useBalance = () => useStore((s) => s.balanceVnd);
export const useTransactions = () => useStore((s) => s.transactions);
export const useActivity = () => useStore((s) => s.activity);
export const usePresets = () => useStore((s) => s.presets);

export const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";
