import { getCatalogModel } from "./catalog.js";
import { GatewayError, type ProviderPreferences, type ResolvedEndpoint } from "./types.js";

export type Hop = { modelId: string; endpoint: ResolvedEndpoint };

/**
 * Build the ordered fallback chain of (model, endpoint) hops.
 * Honors provider.ignore/order/sort/allow_fallbacks and ZDR (data_collection:"deny").
 */
export function resolveChain(modelIds: string[], prefs?: ProviderPreferences): Hop[] {
  const zdrOnly = prefs?.data_collection === "deny";
  const ignore = new Set((prefs?.ignore ?? []).map((s) => s.toLowerCase()));
  const order = (prefs?.order ?? []).map((s) => s.toLowerCase());
  const hops: Hop[] = [];

  for (const modelId of modelIds) {
    const m = getCatalogModel(modelId);
    if (!m) continue;
    let eps = m.endpoints.filter((e) => !ignore.has(e.providerKey));
    if (zdrOnly) eps = eps.filter((e) => e.zdr);

    eps = [...eps].sort((a, b) => {
      if (order.length) {
        const ia = order.indexOf(a.providerKey), ib = order.indexOf(b.providerKey);
        if (ia !== ib) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      }
      if (prefs?.sort === "price" || !prefs?.sort) {
        return (a.pricePrompt + a.priceCompletion) - (b.pricePrompt + b.priceCompletion);
      }
      return 0; // throughput/latency need live metrics (model_endpoints) — kept stable for MVP
    });

    for (const e of eps) hops.push({ modelId, endpoint: e });
  }

  if (hops.length === 0) throw new GatewayError(404, "no_endpoint", "No provider endpoint for the requested model(s)");
  if (prefs?.allow_fallbacks === false) return [hops[0]];
  return hops;
}
