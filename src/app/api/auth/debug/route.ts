import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TEMP diagnostic — reports which env vars are PRESENT at runtime (booleans only,
// never the values). Remove after debugging the Cloudflare env setup.
export function GET() {
  const present = (v?: string) => !!(v && v.trim());
  return NextResponse.json({
    RAISOCIAL_APP_ID: present(process.env.RAISOCIAL_APP_ID),
    RAISOCIAL_APP_SECRET: present(process.env.RAISOCIAL_APP_SECRET),
    RAISOCIAL_SITE: present(process.env.RAISOCIAL_SITE),
    RAISOCIAL_BASE: present(process.env.RAISOCIAL_BASE),
    RAISOCIAL_SERVER_KEY: present(process.env.RAISOCIAL_SERVER_KEY),
    SESSION_SECRET: present(process.env.SESSION_SECRET),
  }, { headers: { "cache-control": "no-store" } });
}
