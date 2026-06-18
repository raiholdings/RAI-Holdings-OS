import { one } from "./db.js";
import { hashKey } from "./crypto.js";
import { GatewayError, type Principal } from "./types.js";

type KeyRow = { id: string; user_id: string; limit_credits: string | null; used_credits: string; disabled: boolean; rpm_limit: number | null };

/** Verify Authorization: Bearer <RAI_API_KEY> → Principal. */
export async function authenticate(authHeader?: string): Promise<Principal> {
  const token = (authHeader || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new GatewayError(401, "no_auth", "Missing API key");
  const row = await one<KeyRow>(
    `select id, user_id, limit_credits, used_credits, disabled, rpm_limit from api_keys where hash = $1`,
    [hashKey(token)],
  );
  if (!row || row.disabled) throw new GatewayError(401, "invalid_key", "Invalid or revoked API key");
  rateLimit(row.id, row.rpm_limit ?? 120);
  return {
    userId: row.user_id,
    apiKeyId: row.id,
    keyHash: hashKey(token),
    limitCredits: row.limit_credits === null ? null : Number(row.limit_credits),
    usedCredits: Number(row.used_credits),
  };
}

// Simple in-memory sliding-window rate limiter (per key). Production: Redis.
const hits = new Map<string, number[]>();
function rateLimit(keyId: string, rpm: number) {
  const now = Date.now();
  const win = now - 60_000;
  const arr = (hits.get(keyId) ?? []).filter((t) => t > win);
  if (arr.length >= rpm) throw new GatewayError(429, "rate_limited", "Rate limit exceeded");
  arr.push(now);
  hits.set(keyId, arr);
}
