"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const field = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.92rem] text-text outline-none focus:border-border-strong";

export function AuthCard({ initialTab = "login", next = "/workspace" }: { initialTab?: "login" | "register"; next?: string }) {
  const { tr, lang, setLang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ username: "", email: "", password: "", confirm_password: "" });
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const path = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = tab === "login"
        ? { username: f.username, password: f.password }
        : { username: f.username, email: f.email, password: f.password, confirm_password: f.confirm_password };
      const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.ok) { router.push(next || "/workspace"); router.refresh(); return; }
      setErr(data.message || tr(t("Failed. Try again.", "Thất bại. Thử lại.")));
    } catch {
      setErr(tr(t("Network error.", "Lỗi kết nối.")));
    }
    setBusy(false);
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5">
      <div className="w-full max-w-[400px]">
        <div className="mb-5 flex items-center justify-between">
          <Logo />
          <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
            {(["en", "vi"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>)}
          </div>
        </div>

        <div className="border border-border bg-surface p-7">
          <div className="mb-1 flex gap-1 rounded-[var(--radius-md)] border border-border p-1 text-[0.85rem]">
            {(["login", "register"] as const).map((tb) => (
              <button key={tb} onClick={() => { setTab(tb); setErr(""); }} className={cn("flex-1 rounded-[var(--radius-md)] px-3 py-1.5 transition-colors", tab === tb ? "bg-accent text-white" : "text-text-2 hover:text-text")}>
                {tb === "login" ? tr(t("Sign in", "Đăng nhập")) : tr(t("Sign up", "Đăng ký"))}
              </button>
            ))}
          </div>

          <p className="mt-4 mb-4 flex items-center gap-2 text-[0.84rem] text-text-2">
            <Icon name="world" size={15} className="text-accent" />
            {tr(t("Connect with your RAI Social account", "Kết nối bằng tài khoản RAI Social"))}
          </p>

          <form onSubmit={submit} className="space-y-3">
            <input value={f.username} onChange={upd("username")} placeholder={tr(t("Username", "Tên đăng nhập"))} className={field} autoFocus autoComplete="username" />
            {tab === "register" && (
              <input value={f.email} onChange={upd("email")} type="email" placeholder={tr(t("Email", "Email"))} className={field} autoComplete="email" />
            )}
            <input value={f.password} onChange={upd("password")} type="password" placeholder={tr(t("Password", "Mật khẩu"))} className={field} autoComplete={tab === "login" ? "current-password" : "new-password"} />
            {tab === "register" && (
              <input value={f.confirm_password} onChange={upd("confirm_password")} type="password" placeholder={tr(t("Confirm password", "Nhập lại mật khẩu"))} className={field} autoComplete="new-password" />
            )}
            {err && <div className="text-[0.84rem] text-err">{err}</div>}
            <button type="submit" disabled={busy} className={`${buttonClass("primary", "md")} w-full`}>
              {busy ? tr(t("Connecting…", "Đang kết nối…")) : tab === "login" ? tr(t("Sign in with RAI Social", "Đăng nhập với RAI Social")) : tr(t("Create account", "Tạo tài khoản"))}
            </button>
          </form>

          <a href="https://raisocial.vn" target="_blank" rel="noreferrer" className="mt-4 block text-center text-[0.8rem] text-text-2 hover:text-text">
            {tr(t("Don't have a RAI Social account? Create one →", "Chưa có tài khoản RAI Social? Tạo ngay →"))}
          </a>
        </div>

        <a href="/" className="mt-4 block text-center text-[0.82rem] text-text-2 hover:text-text">{tr(t("← Back to site", "← Về trang chính"))}</a>
      </div>
    </main>
  );
}
