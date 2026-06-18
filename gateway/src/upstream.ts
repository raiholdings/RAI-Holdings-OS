import { one } from "./db.js";
import { decrypt } from "./crypto.js";
import { config } from "./config.js";
import { GatewayError, type ProviderKey } from "./types.js";

export type UpstreamKey = { key: string; byok: boolean };

/**
 * Resolve the upstream provider key for a request, in priority order:
 *   1. user BYOK key (byok_keys)  → inference not billed (platform fee only)
 *   2. RAI provider credential (provider_credentials, encrypted)
 *   3. bootstrap env key (config.upstream)
 */
export async function getUpstreamKey(providerKey: ProviderKey, userId: string): Promise<UpstreamKey> {
  const byok = await one<{ key_enc: string }>(
    `select b.key_enc from byok_keys b
       join providers p on p.id = b.provider_id
      where b.user_id = $1 and p.slug = $2 and b.active = true`,
    [userId, providerKey],
  );
  if (byok) return { key: decrypt(byok.key_enc), byok: true };

  const cred = await one<{ upstream_key_enc: string }>(
    `select c.upstream_key_enc from provider_credentials c
       join providers p on p.id = c.provider_id
      where p.slug = $1 and c.active = true
      order by c.created_at desc limit 1`,
    [providerKey],
  );
  if (cred) return { key: decrypt(cred.upstream_key_enc), byok: false };

  const envKey = config.upstream[providerKey];
  if (envKey) return { key: envKey, byok: false };

  throw new GatewayError(502, "no_upstream_key", `No upstream credential for ${providerKey}`);
}
