import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, expectedToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (password !== adminPassword()) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  });
  return res;
}
