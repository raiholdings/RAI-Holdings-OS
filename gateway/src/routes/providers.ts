import type { FastifyInstance } from "fastify";
import { q } from "../db.js";

/** GET /providers — upstream providers + data policy. */
export default async function providersRoute(app: FastifyInstance) {
  app.get("/providers", async () => {
    const rows = await q(`select slug, name, data_policy, status from providers order by name`);
    return { data: rows };
  });
}
