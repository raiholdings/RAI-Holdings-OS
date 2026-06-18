import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";
import { q, one, tx } from "../db.js";
import { authenticate } from "../auth.js";
import { markPaidAndCredit } from "../billing.js";
import { config } from "../config.js";
import { buildVnpayUrl, verifyVnpay } from "../payments/vnpay.js";
import { createMomoPayment, verifyMomoIpn } from "../payments/momo.js";
import { GatewayError } from "../types.js";

const newRef = () => "rai" + Date.now() + randomBytes(4).toString("hex");

export default async function billingRoute(app: FastifyInstance) {
  // Create a top-up intent and return a payment URL.
  app.post("/billing/topup", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const body = (req.body ?? {}) as { amount?: number; method?: "vnpay" | "momo" };
    const amount = Math.round(Number(body.amount));
    const method = body.method === "momo" ? "momo" : "vnpay";
    if (!amount || amount < 10_000) throw new GatewayError(400, "bad_amount", "Minimum top-up is 10,000 VND");

    const ref = newRef();
    const walletId = await tx(async (c) => {
      const w = await c.query<{ id: string }>(`select id from wallets where user_id = $1`, [p.userId]);
      const id = w.rows[0]?.id ?? (await c.query<{ id: string }>(`insert into wallets (user_id) values ($1) returning id`, [p.userId])).rows[0].id;
      await c.query(`insert into payment_intents (user_id, wallet_id, method, amount_vnd, ref) values ($1,$2,$3,$4,$5)`, [p.userId, id, method, amount, ref]);
      return id;
    });
    void walletId;

    const orderInfo = `RAI LLMs topup ${amount} VND`;
    if (method === "vnpay") {
      const payUrl = buildVnpayUrl({ amountVnd: amount, ref, orderInfo, ipAddr: req.ip, returnUrl: `${config.publicBaseUrl}/api/v1/billing/vnpay/return` });
      return { ref, method, payUrl };
    }
    const payUrl = await createMomoPayment({ amountVnd: amount, ref, orderInfo, redirectUrl: `${config.publicBaseUrl}/billing/done`, ipnUrl: `${config.publicBaseUrl}/api/v1/billing/momo/ipn` });
    return { ref, method, payUrl };
  });

  // VNPay return (browser) + IPN (server-to-server) — both verify + credit.
  app.get("/billing/vnpay/return", async (req) => {
    const v = verifyVnpay(req.query as Record<string, string>);
    if (!v.valid) throw new GatewayError(400, "bad_signature", "Invalid VNPay signature");
    if (v.success) await markPaidAndCredit(v.ref, v.ref, config.vatPercent);
    return { ok: v.success, ref: v.ref, amount: v.amountVnd };
  });

  app.get("/billing/vnpay/ipn", async (req) => {
    const v = verifyVnpay(req.query as Record<string, string>);
    if (!v.valid) return { RspCode: "97", Message: "Invalid signature" };
    if (v.success) await markPaidAndCredit(v.ref, v.ref, config.vatPercent);
    return { RspCode: "00", Message: "Confirm Success" };
  });

  // MoMo IPN.
  app.post("/billing/momo/ipn", async (req, reply) => {
    const v = verifyMomoIpn((req.body ?? {}) as Record<string, string>);
    if (v.valid && v.success) await markPaidAndCredit(v.ref, v.providerRef, config.vatPercent);
    return reply.code(204).send();
  });

  // History
  app.get("/billing/transactions", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const rows = await q(
      `select t.type, t.amount, t.vnd_amount, t.ref, t.created_at
         from transactions t join wallets w on w.id = t.wallet_id
        where w.user_id = $1 order by t.created_at desc limit 100`,
      [p.userId],
    );
    return { data: rows };
  });

  app.get("/billing/invoices", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const rows = await q(`select number, amount_vnd, vat_percent, status, created_at from invoices where user_id = $1 order by created_at desc limit 100`, [p.userId]);
    return { data: rows };
  });
}
