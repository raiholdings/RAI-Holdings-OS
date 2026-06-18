import type { FastifyInstance } from "fastify";
import { authenticate } from "../auth.js";
import { walletBalance } from "../billing.js";

/** GET /credits — remaining VND credit balance for the authenticated account. */
export default async function creditsRoute(app: FastifyInstance) {
  app.get("/credits", async (req) => {
    const p = await authenticate(req.headers.authorization);
    return { balance: await walletBalance(p.userId), currency: "VND" };
  });
}
