import { NextResponse } from "next/server";
import { models } from "@/lib/llms";

export const dynamic = "force-dynamic";

/** GET /api/llms/v0/models — OpenAI-compatible catalog ({ data: Model[] }). */
export function GET() {
  const data = models.map((m) => ({
    id: m.id,
    name: m.name,
    created: m.created,
    description: m.description.en,
    context_length: m.contextLength,
    architecture: {
      modality: m.modality,
      input_modalities: m.inputModalities,
      output_modalities: m.outputModalities,
      tokenizer: m.tokenizer,
    },
    pricing: m.pricing,
    top_provider: m.endpoints[0]
      ? { context_length: m.endpoints[0].contextLength, max_completion_tokens: m.endpoints[0].maxCompletion }
      : undefined,
    supported_parameters: m.supportedParameters,
  }));
  return NextResponse.json({ data }, { headers: { "cache-control": "no-store" } });
}
