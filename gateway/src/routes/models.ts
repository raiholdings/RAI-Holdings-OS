import type { FastifyInstance } from "fastify";
import { catalog } from "../catalog.js";

/** GET /models — OpenAI-compatible catalog. */
export default async function modelsRoute(app: FastifyInstance) {
  app.get("/models", async () => {
    const data = catalog.map((m) => {
      const ep = m.endpoints[0];
      return {
        id: m.id,
        name: m.name,
        created: 1_770_000_000,
        context_length: m.contextLength,
        architecture: {
          modality: m.modality,
          input_modalities: m.modality.includes("image") ? ["text", "image"] : ["text"],
          output_modalities: ["text"],
          tokenizer: m.id.split("/")[0],
        },
        pricing: { prompt: String(ep.pricePrompt), completion: String(ep.priceCompletion) },
        top_provider: { context_length: m.contextLength, max_completion_tokens: Math.min(64000, Math.floor(m.contextLength / 4)) },
        supported_parameters: m.supportedParameters,
      };
    });
    return { data };
  });
}
