import { one, tx } from "./db.js";
import { GatewayError, type Principal } from "./types.js";

/** Block the request up front if the wallet is empty or the key budget is spent. */
export async function preCheck(p: Principal): Promise<void> {
  const w = await one<{ balance_credits: string }>(`select balance_credits from wallets where user_id = $1`, [p.userId]);
  if (!w || Number(w.balance_credits) <= 0) throw new GatewayError(402, "insufficient_credits", "Out of credits — top up to continue");
  if (p.limitCredits !== null && p.usedCredits >= p.limitCredits) throw new GatewayError(402, "key_budget_exceeded", "Per-key budget exceeded");
}

/** Deduct VND credits from the wallet + key, record a debit transaction. */
export async function debit(p: Principal, billedVnd: number, ref: string): Promise<void> {
  if (billedVnd <= 0) return;
  await tx(async (c) => {
    const w = await c.query<{ id: string }>(`select id from wallets where user_id = $1 for update`, [p.userId]);
    const walletId = w.rows[0]?.id;
    if (!walletId) return;
    await c.query(`update wallets set balance_credits = greatest(0, balance_credits - $2), updated_at = now() where id = $1`, [walletId, billedVnd]);
    await c.query(`update api_keys set used_credits = used_credits + $2 where id = $1`, [p.apiKeyId, billedVnd]);
    await c.query(`insert into transactions (wallet_id, type, amount, ref) values ($1, 'debit', $2, $3)`, [walletId, billedVnd, ref]);
  });
}

export type LogRow = {
  userId: string; apiKeyId: string; genId: string; modelSlug: string; providerSlug: string;
  promptTokens: number; completionTokens: number; costUsd: number; latencyMs: number;
  finishReason: string; status: string;
};

export async function recordRequest(r: LogRow): Promise<void> {
  await one(
    `insert into requests_log
       (user_id, api_key_id, gen_id, model_slug, provider_slug, prompt_tokens, completion_tokens, cost, latency_ms, finish_reason, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     on conflict (gen_id) do nothing`,
    [r.userId, r.apiKeyId, r.genId, r.modelSlug, r.providerSlug, r.promptTokens, r.completionTokens, r.costUsd, r.latencyMs, r.finishReason, r.status],
  );
}

export async function walletBalance(userId: string): Promise<number> {
  const w = await one<{ balance_credits: string }>(`select balance_credits from wallets where user_id = $1`, [userId]);
  return w ? Number(w.balance_credits) : 0;
}
