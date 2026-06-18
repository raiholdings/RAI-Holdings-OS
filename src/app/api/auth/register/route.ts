import { NextResponse } from "next/server";
import { registerRaiSocial, getRaiSocialUser, RaiSocialError } from "@/lib/raisocial";
import { setSession, publicUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { username?: string; email?: string; password?: string; confirm_password?: string };
  const username = (b.username || "").trim();
  const email = (b.email || "").trim();
  const password = b.password || "";
  const confirm = b.confirm_password || password;
  if (!username || !email || !password) {
    return NextResponse.json({ ok: false, error: "missing_fields", message: "Nhập đủ tài khoản, email, mật khẩu" }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ ok: false, error: "password_mismatch", message: "Mật khẩu nhập lại không khớp" }, { status: 400 });
  }
  try {
    const auth = await registerRaiSocial({ username, email, password, confirm_password: confirm });
    const user = await getRaiSocialUser(auth.accessToken, auth.userId);
    const session = { userId: user.userId, username: user.username || username, name: user.name, avatar: user.avatar, token: auth.accessToken };
    await setSession(session);
    return NextResponse.json({ ok: true, user: publicUser({ ...session, iat: 0 }) });
  } catch (e) {
    const err = e instanceof RaiSocialError ? e : new RaiSocialError("error", "Đăng ký thất bại");
    const status = err.code === "not_configured" ? 503 : 400;
    return NextResponse.json({ ok: false, error: err.code, message: err.message }, { status });
  }
}
