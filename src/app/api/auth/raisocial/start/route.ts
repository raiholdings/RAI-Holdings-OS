import { NextResponse } from "next/server";
import { authorizeUrl, oauthConfigured } from "@/lib/raisocial-oauth";

export const dynamic = "force-dynamic";

// Kick off "Login with RAI Social": redirect to the RAI Social authorize page.
// Use a manual 302 (NextResponse.redirect to an EXTERNAL origin can 500 on
// OpenNext/Workers). RAI Social's /oauth has no state param, so stash `next`.
export async function GET(req: Request) {
  if (!oauthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", req.url));
  }
  const next = new URL(req.url).searchParams.get("next") || "/workspace";
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: authorizeUrl(),
      "Set-Cookie": `rai_oauth_next=${encodeURIComponent(next)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}
