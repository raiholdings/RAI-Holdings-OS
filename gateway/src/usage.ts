import { one } from "./db.js";
import { config } from "./config.js";
import type { ProviderUsage, ResolvedEndpoint } from "./types.js";

/** Resolve markup% — most specific wins: model > provider > global > config default. */
export async function resolveMarkup(modelId: string, providerKey: string): Promise<number> {
  const rows = await one<{ percent: string }>(
    `select percent from markups
       where (scope='model' and target=$1) or (scope='provider' and target=$2) or scope='global'
       order by case scope when 'model' then 0 when 'provider' then 1 else 2 end
       limit 1`,
    [modelId, providerKey],
  );
  return rows ? Number(rows.percent) : config.defaultMarkupPercent;
}

export type Cost = { upstreamUsd: number; billedUsd: number; billedVnd: number; markupPercent: number };

export async function computeCost(usage: ProviderUsage, ep: ResolvedEndpoint, modelId: string): Promise<Cost> {
  const markup = await resolveMarkup(modelId, ep.providerKey);
  const upstreamUsd = usage.promptTokens * ep.pricePrompt + usage.completionTokens * ep.priceCompletion;
  const billedUsd = upstreamUsd * (1 + markup / 100);
  const billedVnd = Math.round(billedUsd * config.fxUsdVnd);
  return { upstreamUsd, billedUsd, billedVnd, markupPercent: markup };
}
