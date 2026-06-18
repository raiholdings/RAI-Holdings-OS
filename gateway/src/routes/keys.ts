import type { FastifyInstance } from "fastify";
import { q, one, tx } from "../db.js";
import { newApiKey } from "../crypto.js";
import { authenticate } from "../auth.js";
import { config } from "../config.js";
import { GatewayError } from "../types.js";

type KeyRow = { id: string; label: string | null; hash: string; limit_credits: string | null; used_credits: string; disabled: boolean; created_at: string };

export default async function keysRoute(app: FastifyInstance) {
  // Create a user (if new) + wallet + key. Admin-gated (bootstrap / provisioning).
  app.post("/keys", async (req, reply) => {
    const admin = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
    if (admin !== config.adminToken) throw new GatewayError(401, "admin_only", "Admin token required");
    const body = (req.body ?? {}) as { email?: string; label?: string; limit?: number; topup?: number };
    if (!body.email) throw new GatewayError(400, "no_email", "email is required");

    const out = await tx(async (c) => {
      const u = await c.query<{ id: string }>(
        `insert into users (email) values ($1) on conflict (email) do update set email = excluded.email returning id`,
        [body.email],
      );
      const userId = u.rows[0].id;
      const w = await c.query<{ id: string }>(`select id from wallets where user_id = $1`, [userId]);
      let walletId = w.rows[0]?.id;
      if (!walletId) {
        const nw = await c.query<{ id: string }>(`insert into wallets (user_id, balance_credits) values ($1, $2) returning id`, [userId, body.topup ?? 0]);
        walletId = nw.rows[0].id;
      } else if (body.topup) {
        await c.query(`update wallets set balance_credits = balance_credits + $2, updated_at = now() where id = $1`, [walletId, body.topup]);
        await c.query(`insert into transactions (wallet_id, type, amount, ref) values ($1,'topup',$2,'admin')`, [walletId, body.topup]);
      }
      const { key, hash } = newApiKey();
      await c.query(`insert into api_keys (user_id, hash, label, limit_credits) values ($1,$2,$3,$4)`, [userId, hash, body.label ?? "default", body.limit ?? null]);
      return { key, hash, label: body.label ?? "default", userId };
    });
    return reply.code(201).send(out);
  });

  // List the authenticated user's keys (hashes only — raw keys are never retrievable).
  app.get("/keys", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const rows = await q<KeyRow>(`select id, label, hash, limit_credits, used_credits, disabled, created_at from api_keys where user_id = $1 order by created_at desc`, [p.userId]);
    return { data: rows };
  });

  app.patch("/keys/:hash", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const { hash } = req.params as { hash: string };
    const body = (req.body ?? {}) as { disabled?: boolean; limit?: number | null };
    const r = await one<{ id: string }>(
      `update api_keys set disabled = coalesce($3, disabled), limit_credits = coalesce($4, limit_credits)
        where hash = $1 and user_id = $2 returning id`,
      [hash, p.userId, body.disabled ?? null, body.limit ?? null],
    );
    if (!r) throw new GatewayError(404, "not_found", "Key not found");
    return { ok: true };
  });

  app.delete("/keys/:hash", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const { hash } = req.params as { hash: string };
    await one(`update api_keys set disabled = true where hash = $1 and user_id = $2 returning id`, [hash, p.userId]);
    return { ok: true };
  });
}
