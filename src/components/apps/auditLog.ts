"use client";

import { useSyncExternalStore } from "react";

export type AuditEntry = {
  seq: number;
  app: string;
  dir: "ui→host" | "host→ui";
  kind: "tools/call" | "result" | "error" | "consent" | "ui/render" | "ui/ready";
  detail: string;
};

let entries: AuditEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function logAudit(e: Omit<AuditEntry, "seq">) {
  seq += 1;
  entries = [{ ...e, seq }, ...entries].slice(0, 200);
  // also console for dev (auditable trail)
  // eslint-disable-next-line no-console
  console.info(`[rai-apps audit] ${e.dir} ${e.kind} (${e.app}) ${e.detail}`);
  emit();
}

export function clearAudit() {
  entries = [];
  emit();
}

export function useAuditLog(): AuditEntry[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => entries,
    () => entries,
  );
}
