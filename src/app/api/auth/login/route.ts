import { NextResponse } from "next/server";
import { loginRaiSocial, getRaiSocialUser, RaiSocialError } from "@/lib/raisocial";
import { setSession, publicUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = (body.username || "").trim();
  const password = body.password || "";
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: "missing_fields", message: "Nhập tài khoản và mật khẩu" }, { status: 400 });
  }
  try {
    const auth = await loginRaiSocial(username, password);
    const user = await getRaiSocialUser(auth.accessToken, auth.userId);
    const session = { userId: user.userId, username: user.username || username, name: user.name, avatar: user.avatar, token: auth.accessToken };
    await setSession(session);
    return NextResponse.json({ ok: true, user: publicUser({ ...session, iat: 0 }) });
  } catch (e) {
    const err = e instanceof RaiSocialError ? e : new RaiSocialError("error", "Đăng nhập thất bại");
    const status = err.code === "not_configured" ? 503 : 401;
    return NextResponse.json({ ok: false, error: err.code, message: err.message }, { status });
  }
}
