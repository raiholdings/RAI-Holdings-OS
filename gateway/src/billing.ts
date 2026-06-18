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

/**
 * Mark a payment intent paid, credit the wallet, record a top-up transaction and
 * issue a VAT invoice. Idempotent: a non-pending intent is a no-op.
 */
export async function markPaidAndCredit(ref: string, providerRef: string, vatPercent: number): Promise<boolean> {
  return tx(async (c) => {
    const i = await c.query<{ id: string; user_id: string; wallet_id: string | null; amount_vnd: string; status: string }>(
      `select id, user_id, wallet_id, amount_vnd, status from payment_intents where ref = $1 for update`,
      [ref],
    );
    const intent = i.rows[0];
    if (!intent || intent.status !== "pending") return false; // idempotent / unknown
    const amount = Number(intent.amount_vnd);

    let walletId = intent.wallet_id;
    if (!walletId) {
      const w = await c.query<{ id: string }>(`select id from wallets where user_id = $1`, [intent.user_id]);
      walletId = w.rows[0]?.id ?? (await c.query<{ id: string }>(`insert into wallets (user_id) values ($1) returning id`, [intent.user_id])).rows[0].id;
    }
    await c.query(`update wallets set balance_credits = balance_credits + $2, updated_at = now() where id = $1`, [walletId, amount]);
    await c.query(`insert into transactions (wallet_id, type, amount, vnd_amount, ref) values ($1,'topup',$2,$2,$3)`, [walletId, amount, providerRef || ref]);
    await c.query(`update payment_intents set status = 'paid', provider_ref = $2, paid_at = now() where id = $1`, [intent.id, providerRef]);
    const number = "RAI-" + ref.slice(-10).toUpperCase();
    await c.query(`insert into invoices (user_id, payment_intent_id, number, amount_vnd, vat_percent) values ($1,$2,$3,$4,$5) on conflict (number) do nothing`,
      [intent.user_id, intent.id, number, amount, vatPercent]);
    return true;
  });
}
