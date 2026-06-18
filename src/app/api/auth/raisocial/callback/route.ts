import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCode, getOAuthUser } from "@/lib/raisocial-oauth";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// RAI Social redirects here with ?code=XXX after the user authorizes.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));
  if (!code) return fail("oauth_no_code");

  const jar = await cookies();
  const next = jar.get("rai_oauth_next")?.value || "/workspace";

  try {
    const token = await exchangeCode(code);
    const u = await getOAuthUser(token);
    await setSession({ userId: u.userId, username: u.username, name: u.name, avatar: u.avatar, token });
    const res = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/workspace", req.url));
    res.cookies.set("rai_oauth_next", "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return fail("oauth_failed");
  }
}
