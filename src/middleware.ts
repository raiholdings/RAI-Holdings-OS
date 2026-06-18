import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing for RAI subdomains.
 *
 * Satellite product domains (raigpt.vn, raisocial.vn, …) are independent
 * websites and are intentionally NOT routed here — each platform's marketing
 * landing now lives inside the workspace at /workspace/platform/[slug].
 *
 * Kept inline (no heavy imports) so the edge middleware bundle stays small.
 */
// The OS Console lives at /app; serve it on the app.raiholdings.vn subdomain.
const CONSOLE_HOST = "app.raiholdings.vn";
// The customer Workspace lives at /workspace; also served on its own subdomain.
const WORKSPACE_HOST = "workspace.raiholdings.vn";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].replace(/^www\./, "");

  // RAI Social OAuth returns with ?code=… (callback URL is the default wo_login.php,
  // or the domain root) → hand it to our callback handler.
  if (
    (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/wo_login.php") &&
    req.nextUrl.searchParams.get("code")
  ) {
    const cb = req.nextUrl.clone();
    cb.pathname = "/api/auth/raisocial/callback";
    return NextResponse.redirect(cb);
  }

  // OS Console — app.raiholdings.vn/* → /app/*
  if (host === CONSOLE_HOST) {
    const url = req.nextUrl.clone();
    if (url.pathname.startsWith("/app")) return NextResponse.next();
    url.pathname = url.pathname === "/" ? "/app" : `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Workspace — workspace.raiholdings.vn/* → /workspace/* (login passes through)
  if (host === WORKSPACE_HOST) {
    const url = req.nextUrl.clone();
    if (url.pathname.startsWith("/workspace") || url.pathname.startsWith("/login")) return NextResponse.next();
    url.pathname = url.pathname === "/" ? "/workspace" : `/workspace${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Everything else (main site, localhost, independent product domains) passes through.
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and API routes (the lead form posts to /api/lead).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
