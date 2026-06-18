import type { FastifyInstance } from "fastify";
import { one } from "../db.js";
import { authenticate } from "../auth.js";
import { GatewayError } from "../types.js";

/** GET /generation?id=gen-xxx — request stats (cost, tokens, latency) for audit. */
export default async function generationRoute(app: FastifyInstance) {
  app.get("/generation", async (req) => {
    const p = await authenticate(req.headers.authorization);
    const id = (req.query as { id?: string }).id;
    if (!id) throw new GatewayError(400, "no_id", "id is required");
    const row = await one(
      `select gen_id as id, model_slug, provider_slug, prompt_tokens, completion_tokens, cost, latency_ms, finish_reason, status, created_at
         from requests_log where gen_id = $1 and user_id = $2`,
      [id, p.userId],
    );
    if (!row) throw new GatewayError(404, "not_found", "Generation not found");
    return { data: row };
  });
}
