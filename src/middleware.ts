import { NextResponse, type NextRequest } from "next/server";

/**
 * Satellite-domain routing.
 *
 * Each RAI venture has its own domain (e.g. raigpt.vn). When a request arrives
 * on one of those hostnames, rewrite it to the matching landing under /v/[slug]
 * — the URL bar stays on the satellite domain. The main raiholdings.vn site and
 * localhost are untouched (host not in the map → pass through).
 *
 * Kept inline (no heavy imports) so the edge middleware bundle stays small.
 */
const HOST_TO_SLUG: Record<string, string> = {
  "raigpt.vn": "rai-gpt",
  "raichatbot.vn": "rai-chatbot",
  "raiagent.vn": "rai-agent",
  "raidata.vn": "rai-data",
  "raicdp.vn": "rai-cdp",
  "rain8n.vn": "rai-n8n",
  "raiodoo.vn": "rai-odoo",
  "raierpnext.vn": "rai-erpnext",
  "raitravel.vn": "rai-travel",
  "raicommerce.vn": "rai-commerce",
  "raiads.vn": "rai-ads",
};

// The OS Console lives at /app; serve it on the app.raiholdings.vn subdomain.
const CONSOLE_HOST = "app.raiholdings.vn";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].replace(/^www\./, "");

  // OS Console — app.raiholdings.vn/* → /app/*
  if (host === CONSOLE_HOST) {
    const url = req.nextUrl.clone();
    if (url.pathname.startsWith("/app")) return NextResponse.next();
    url.pathname = url.pathname === "/" ? "/app" : `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Satellite venture domains — raigpt.vn/* → /v/rai-gpt
  const slug = HOST_TO_SLUG[host];
  if (!slug) return NextResponse.next();

  const url = req.nextUrl.clone();
  if (url.pathname.startsWith("/v/")) return NextResponse.next();
  url.pathname = `/v/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on everything except Next internals and API routes (the lead form posts to /api/lead).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
