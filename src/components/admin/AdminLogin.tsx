"use client";

import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";

export function AdminLogin() {
  const { tr } = useLang();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setErr(true);
    } catch {
      setErr(true);
    }
    setBusy(false);
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5">
      <form onSubmit={submit} className="w-full max-w-[360px] border border-border bg-surface p-7">
        <div className="mb-5 flex items-center justify-between">
          <Logo />
          <span className="mono inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-accent/10 px-2 py-0.5 text-[0.62rem] uppercase tracking-wider text-accent">
            <Icon name="shield" size={12} /> admin
          </span>
        </div>
        <h1 className="text-[1.25rem] font-medium tracking-tight text-text">{tr(t("Admin sign in", "Đăng nhập quản trị"))}</h1>
        <p className="mt-1 mb-5 text-[0.86rem] text-text-2">{tr(t("Content management for RAI Holdings OS.", "Quản trị nội dung RAI Holdings OS."))}</p>
        <label className="label mb-1 block text-text-2">{tr(t("Password", "Mật khẩu"))}</label>
        <input
          type="password"
          value={password}
          autoFocus
          onChange={(e) => { setPassword(e.target.value); setErr(false); }}
          className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.92rem] text-text outline-none focus:border-border-strong"
          placeholder="••••••••"
        />
        {err && <div className="mt-2 text-[0.82rem] text-err">{tr(t("Wrong password.", "Sai mật khẩu."))}</div>}
        <button type="submit" disabled={busy || !password} className={`${buttonClass("primary", "md")} mt-4 w-full`}>
          {busy ? tr(t("Signing in…", "Đang vào…")) : tr(t("Sign in", "Đăng nhập"))}
        </button>
        <a href="/" className="mt-3 block text-center text-[0.82rem] text-text-2 hover:text-text">{tr(t("← Back to site", "← Về trang chính"))}</a>
      </form>
    </main>
  );
}
