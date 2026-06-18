// Workspace wallet & usage — SERVER ONLY. Credit ledger + metered usage on
// Postgres. Balance lives on workspace.orgs.balance_vnd; changes go through the
// atomic wallet_apply RPC so balance and ledger never drift.
import { dbSelect, dbInsert, dbRpc } from "@/lib/db";

export type Txn = { id: string; kind: string; amountVnd: number; balanceAfter: number; note: string; createdAt: string };
export type UsageEvent = { id: string; product: string; model: string; units: number; costVnd: number; createdAt: string };

type TxnRow = { id: string; kind: string; amount_vnd: number; balance_after: number; note: string | null; created_at: string };
type UsageRow = { id: string; product: string; model: string | null; units: number; cost_vnd: number; created_at: string };

export async function listTxns(orgId: string, limit = 50): Promise<Txn[]> {
  const rows = await dbSelect<TxnRow>("wallet_txns", `org_id=eq.${enc(orgId)}&order=created_at.desc&limit=${limit}`);
  return rows.map((r) => ({ id: r.id, kind: r.kind, amountVnd: Number(r.amount_vnd), balanceAfter: Number(r.balance_after), note: r.note ?? "", createdAt: r.created_at }));
}

export async function listUsage(orgId: string, limit = 50): Promise<UsageEvent[]> {
  const rows = await dbSelect<UsageRow>("usage_events", `org_id=eq.${enc(orgId)}&order=created_at.desc&limit=${limit}`);
  return rows.map((r) => ({ id: r.id, product: r.product, model: r.model ?? "", units: Number(r.units), costVnd: Number(r.cost_vnd), createdAt: r.created_at }));
}

/** Apply a signed credit/debit atomically; returns the new balance. */
export async function applyWallet(orgId: string, amountVnd: number, kind: "topup" | "debit" | "adjust" | "refund", note: string, by: string): Promise<number> {
  const bal = await dbRpc<number>("wallet_apply", { p_org: orgId, p_amount: Math.trunc(amountVnd), p_kind: kind, p_note: note, p_by: by });
  return Number(bal);
}

/** Record a usage event and debit its cost (if any) from the org wallet. */
export async function recordUsage(orgId: string, by: string, e: { product: string; model?: string; units?: number; costVnd?: number; meta?: Record<string, unknown> }): Promise<{ balanceVnd: number | null }> {
  const cost = Math.max(0, Math.trunc(e.costVnd ?? 0));
  await dbInsert("usage_events", {
    id: randomId(), org_id: orgId, rai_user_id: by, product: e.product,
    model: e.model ?? null, units: e.units ?? 1, cost_vnd: cost, meta: e.meta ?? {},
  });
  if (cost > 0) {
    const bal = await applyWallet(orgId, -cost, "debit", `usage:${e.product}${e.model ? `:${e.model}` : ""}`, by);
    return { balanceVnd: bal };
  }
  return { balanceVnd: null };
}

function randomId(): string {
  try { return crypto.randomUUID(); } catch { return `u-${Date.now()}-${Math.round(Math.random() * 1e9)}`; }
}
function enc(v: string): string { return encodeURIComponent(v); }
