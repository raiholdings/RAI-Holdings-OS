import type { FastifyInstance, FastifyRequest } from "fastify";
import { q, one } from "../db.js";
import { encrypt } from "../crypto.js";
import { config } from "../config.js";
import { GatewayError } from "../types.js";

function requireAdmin(req: FastifyRequest) {
  const tok = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!tok || tok !== config.adminToken) throw new GatewayError(401, "admin_only", "Admin token required");
}

export default async function adminRoute(app: FastifyInstance) {
  app.addHook("preHandler", async (req) => requireAdmin(req));

  // ---- markups ----
  app.get("/admin/markups", async () => ({ data: await q(`select id, scope, target, percent from markups order by scope, target`) }));

  app.post("/admin/markups", async (req) => {
    const b = (req.body ?? {}) as { scope?: string; target?: string | null; percent?: number };
    if (!b.scope || !["global", "model", "provider"].includes(b.scope)) throw new GatewayError(400, "bad_scope", "scope must be global|model|provider");
    if (typeof b.percent !== "number") throw new GatewayError(400, "bad_percent", "percent required");
    const row = await one(
      `insert into markups (scope, target, percent) values ($1,$2,$3)
         on conflict (scope, coalesce(target,'')) do update set percent = excluded.percent
       returning id, scope, target, percent`,
      [b.scope, b.scope === "global" ? null : b.target ?? null, b.percent],
    );
    return { data: row };
  });

  app.delete("/admin/markups/:id", async (req) => {
    const { id } = req.params as { id: string };
    await one(`delete from markups where id = $1 returning id`, [id]);
    return { ok: true };
  });

  // ---- provider upstream credential (encrypted at rest) ----
  app.post("/admin/providers/:slug/credential", async (req) => {
    const { slug } = req.params as { slug: string };
    const b = (req.body ?? {}) as { key?: string };
    if (!b.key) throw new GatewayError(400, "no_key", "key required");
    const prov = await one<{ id: string }>(`select id from providers where slug = $1`, [slug]);
    if (!prov) throw new GatewayError(404, "no_provider", "Unknown provider");
    await one(`update provider_credentials set active = false where provider_id = $1 returning id`, [prov.id]);
    await one(`insert into provider_credentials (provider_id, upstream_key_enc, active) values ($1,$2,true) returning id`, [prov.id, encrypt(b.key)]);
    return { ok: true, provider: slug };
  });

  // ---- revenue / usage stats ----
  app.get("/admin/stats", async () => {
    const totals = await one<{ requests: string; revenue: string; prompt: string; completion: string }>(
      `select count(*) as requests, coalesce(sum(cost),0) as revenue,
              coalesce(sum(prompt_tokens),0) as prompt, coalesce(sum(completion_tokens),0) as completion
         from requests_log where status = 'ok'`,
    );
    const byModel = await q(
      `select model_slug, count(*) as requests, coalesce(sum(cost),0) as revenue
         from requests_log where status = 'ok' group by model_slug order by revenue desc limit 20`,
    );
    const topups = await one<{ total: string }>(`select coalesce(sum(amount),0) as total from transactions where type = 'topup'`);
    return { totals, byModel, topupsTotalVnd: Number(topups?.total ?? 0) };
  });
}
