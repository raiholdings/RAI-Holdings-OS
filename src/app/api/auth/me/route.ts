import { NextResponse } from "next/server";
import { getSession, publicUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  return NextResponse.json({ user: s ? publicUser(s) : null }, { headers: { "cache-control": "no-store" } });
}
