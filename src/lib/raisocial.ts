// RAI Social (WoWonder) REST API — server-side only. Never import in client code.
// Auth model: every call sends `server_key`; login/register return an access_token.
const BASE = (process.env.RAISOCIAL_BASE || "https://raisocial.vn/api").replace(/\/$/, "");
const SERVER_KEY = process.env.RAISOCIAL_SERVER_KEY || "";

export class RaiSocialError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

function ensureConfigured() {
  if (!SERVER_KEY) throw new RaiSocialError("not_configured", "RAISOCIAL_SERVER_KEY is not set on the server");
}

async function post(path: string, params: Record<string, string>, query = ""): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({ server_key: SERVER_KEY, ...params });
  const res = await fetch(`${BASE}/${path}${query}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return json;
}

function errText(json: Record<string, unknown>): string {
  const e = json.errors as { error_text?: string } | undefined;
  return e?.error_text || "Unknown error";
}

export type RaiSocialAuth = { accessToken: string; userId: string };

export async function loginRaiSocial(username: string, password: string): Promise<RaiSocialAuth> {
  ensureConfigured();
  const json = await post("auth", { username, password, device_id: "rai-os-web" });
  if (String(json.api_status) !== "200" || !json.access_token) {
    throw new RaiSocialError("auth_failed", errText(json));
  }
  return { accessToken: String(json.access_token), userId: String(json.user_id) };
}

export async function registerRaiSocial(input: { username: string; email: string; password: string; confirm_password: string }): Promise<RaiSocialAuth> {
  ensureConfigured();
  const json = await post("create-account", input);
  if (String(json.api_status) !== "200" || !json.access_token) {
    throw new RaiSocialError("register_failed", errText(json));
  }
  return { accessToken: String(json.access_token), userId: String(json.user_id) };
}

export type RaiSocialUser = { userId: string; username: string; name: string; avatar: string; email: string };

export async function getRaiSocialUser(accessToken: string, userId: string): Promise<RaiSocialUser> {
  ensureConfigured();
  const json = await post("get-user-data", { user_id: userId, fetch: "user_data" }, `?access_token=${encodeURIComponent(accessToken)}`);
  const d = (json.user_data ?? {}) as Record<string, unknown>;
  return {
    userId: String(d.user_id ?? userId),
    username: String(d.username ?? ""),
    name: String(d.name || d.first_name || d.username || "RAI user"),
    avatar: String(d.avatar ?? ""),
    email: String(d.email ?? ""),
  };
}
