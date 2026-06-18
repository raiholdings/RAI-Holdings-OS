import Fastify from "fastify";
import cors from "@fastify/cors";
import { GatewayError } from "./types.js";
import chatRoute from "./routes/chat.js";
import modelsRoute from "./routes/models.js";
import creditsRoute from "./routes/credits.js";
import keysRoute from "./routes/keys.js";
import generationRoute from "./routes/generation.js";
import providersRoute from "./routes/providers.js";
import billingRoute from "./routes/billing.js";
import adminRoute from "./routes/admin.js";

process.on("unhandledRejection", (e) => { console.error("[fatal] unhandledRejection:", e); process.exit(1); });
process.on("uncaughtException", (e) => { console.error("[fatal] uncaughtException:", e); process.exit(1); });

const PORT = Number(process.env.PORT) || 8080;

async function main() {
  console.log(`[boot] starting gateway, PORT=${PORT}`);
  const app = Fastify({ logger: true, bodyLimit: 8 * 1024 * 1024 });

  await app.register(cors, { origin: true });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof GatewayError) {
      return reply.code(err.status).send({ error: { message: err.message, code: err.code, type: "gateway_error" } });
    }
    app.log.error(err);
    return reply.code(500).send({ error: { message: "Internal error", code: "internal", type: "gateway_error" } });
  });

  app.get("/", async () => ({ ok: true, service: "rai-llms-gateway", docs: "/api/v1/models" }));
  app.get("/health", async () => ({ ok: true, service: "rai-llms-gateway" }));

  await app.register(async (v1) => {
    await v1.register(chatRoute);
    await v1.register(modelsRoute);
    await v1.register(creditsRoute);
    await v1.register(keysRoute);
    await v1.register(generationRoute);
    await v1.register(providersRoute);
    await v1.register(billingRoute);
    await v1.register(adminRoute);
  }, { prefix: "/api/v1" });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`[boot] gateway listening on 0.0.0.0:${PORT}`);
}

main().catch((e) => { console.error("[fatal] boot failed:", e); process.exit(1); });
