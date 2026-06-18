// RAI Social (WoWonder) OAuth "Login with" flow — server-side only.
//   1) send user to  {SITE}/oauth?app_id=APP_ID
//   2) RAI Social redirects back to our domain with ?code=XXX
//   3) exchange:  {SITE}/authorize?app_id&app_secret&code  -> { access_token }
//   4) user data: {SITE}/app_api?access_token&type=get_user_data -> { user_data }
// Env read inside functions (Cloudflare Workers populates process.env per-request).
function site() {
  return (process.env.RAISOCIAL_SITE || (process.env.RAISOCIAL_BASE || "https://raisocial.vn/api").replace(/\/api\/?$/, "") || "https://raisocial.vn").replace(/\/$/, "");
}
function appId() { return process.env.RAISOCIAL_APP_ID || ""; }
function appSecret() { return process.env.RAISOCIAL_APP_SECRET || ""; }

export class RaiOAuthError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

export function oauthConfigured(): boolean { return !!appId() && !!appSecret(); }

export function authorizeUrl(): string {
  return `${site()}/oauth?app_id=${encodeURIComponent(appId())}`;
}

export async function exchangeCode(code: string): Promise<string> {
  if (!oauthConfigured()) throw new RaiOAuthError("not_configured", "RAISOCIAL_APP_ID/SECRET not set");
  const url = `${site()}/authorize?app_id=${encodeURIComponent(appId())}&app_secret=${encodeURIComponent(appSecret())}&code=${encodeURIComponent(code)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; errors?: { message?: string } };
  if (!json.access_token) throw new RaiOAuthError("exchange_failed", json.errors?.message || "Code exchange failed");
  return json.access_token;
}

export type OAuthUser = { userId: string; username: string; name: string; avatar: string };

export async function getOAuthUser(accessToken: string): Promise<OAuthUser> {
  const url = `${site()}/app_api?access_token=${encodeURIComponent(accessToken)}&type=get_user_data`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { user_data?: Record<string, unknown>; errors?: { message?: string } };
  const d = json.user_data;
  if (!d) throw new RaiOAuthError("user_failed", json.errors?.message || "Could not fetch user");
  const name = [d.first_name, d.last_name].filter(Boolean).join(" ").trim() || String(d.username || "RAI user");
  return {
    userId: String(d.id ?? ""),
    username: String(d.username ?? ""),
    name,
    avatar: String(d.profile_picture ?? ""),
  };
}
