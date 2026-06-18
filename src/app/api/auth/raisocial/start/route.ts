import { NextResponse } from "next/server";
import { authorizeUrl, oauthConfigured } from "@/lib/raisocial-oauth";

export const dynamic = "force-dynamic";

// Kick off "Login with RAI Social": redirect to the RAI Social authorize page.
// RAI Social's /oauth has no state param, so we stash `next` in a short cookie.
export async function GET(req: Request) {
  if (!oauthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", req.url));
  }
  const next = new URL(req.url).searchParams.get("next") || "/workspace";
  const res = NextResponse.redirect(authorizeUrl());
  res.cookies.set("rai_oauth_next", next, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
