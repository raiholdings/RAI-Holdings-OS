"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import { ventureColor, type Venture } from "@/lib/ventures";

export function VentureLanding({ v }: { v: Venture }) {
  const { tr } = useLang();
  const C = ventureColor(v);

  return (
    <div>
      {/* ───────── hero ───────── */}
      <header className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="p-8 sm:p-12" style={{ borderTop: `3px solid ${C}` }}>
          <span className="mono text-[0.72rem] text-text-2">{v.domain}</span>
          <div className="mt-3 flex items-center gap-3">
            <span className="accent-rule" style={{ color: C }} />
            <span className="label" style={{ color: C }}>{tr(v.eyebrow)}</span>
          </div>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,2.9rem)] font-medium leading-[1.07] text-text">
            {tr(v.title)}
          </h1>
          <p className="mt-4 max-w-2xl text-[1.05rem] text-text-2">{tr(v.subtitle)}</p>
          {v.quote && (
            <blockquote className="mt-6 max-w-2xl border-l-2 pl-4 text-[1.05rem] italic text-text" style={{ borderColor: C }}>
              “{tr(v.quote)}”
            </blockquote>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#contact" className={buttonClass("primary", "lg")} style={{ background: C, borderColor: C }}>
              {tr(v.ctaPrimary)} <Icon name="arrow-up-right" size={18} />
            </a>
            <a href="#features" className={buttonClass("outline", "lg")}>{tr(t("Explore features", "Khám phá tính năng"))}</a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          {v.metrics.map((m, i) => (
            <div key={i} className="bg-surface px-5 py-6 text-center">
              <div className="font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.6vw,1.9rem)] font-medium" style={{ color: C }}>{m.value}</div>
              <div className="mono mt-1.5 text-[0.66rem] uppercase tracking-wide text-text-2">{tr(m.label)}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ───────── features ───────── */}
      <section id="features" className="mt-12 scroll-mt-20">
        <SectionTitle c={C} label={t("Capabilities", "Tính năng")} title={t("What you get", "Bạn nhận được gì")} />
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2">
          {v.features.map((f) => (
            <div key={f.n} className="bg-surface p-6">
              <span className="mono text-[0.9rem] font-medium" style={{ color: C }}>{f.n}</span>
              <h3 className="mt-2 text-[1.08rem] font-medium leading-snug text-text">{tr(f.title)}</h3>
              <p className="mt-2 text-[0.9rem] text-text-2">{tr(f.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── use cases ───────── */}
      <section id="use-cases" className="mt-12 scroll-mt-20">
        <SectionTitle c={C} label={t("Use cases", "Tình huống ứng dụng")} title={t("Where teams put it to work", "Nơi các đội ngũ áp dụng")} />
        <div className="grid gap-4 sm:grid-cols-3">
          {v.useCases.map((u, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
              <span className="accent-rule mb-3" style={{ color: C }} />
              <h3 className="font-[family-name:var(--font-display)] text-[1.05rem] font-medium text-text">{tr(u.title)}</h3>
              <p className="mt-2 text-[0.88rem] text-text-2">{tr(u.body)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── pricing ───────── */}
      <section id="pricing" className="mt-12 scroll-mt-20">
        <SectionTitle c={C} label={t("Pricing", "Bảng giá")} title={t("Simple, transparent plans", "Gói rõ ràng, minh bạch")} note={v.pricingNote} />
        <div className="grid gap-4 sm:grid-cols-2">
          {v.pricing.map((tier, i) => (
            <div key={i} className="relative rounded-[var(--radius-lg)] border bg-surface p-6" style={{ borderColor: tier.featured ? C : "var(--color-border)" }}>
              {tier.featured && (
                <span className="mono absolute right-4 top-4 rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.62rem] uppercase text-white" style={{ background: C }}>
                  {tr(t("Popular", "Phổ biến"))}
                </span>
              )}
              <h3 className="font-[family-name:var(--font-display)] text-[1.15rem] font-medium text-text">{tr(tier.name)}</h3>
              <div className="mt-1 text-[1.3rem] font-medium" style={{ color: C }}>{tr(tier.price)}</div>
              <ul className="mt-4 grid gap-2 border-t border-border pt-4">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-[0.88rem] text-text-2">
                    <Icon name="check" size={16} className="mt-0.5 flex-none" style={{ color: C }} />
                    {tr(feat)}
                  </li>
                ))}
              </ul>
              <a href="#contact" className={buttonClass("outline", "md") + " mt-5 w-full"}>{tr(t("Get started", "Bắt đầu"))}</a>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── contact / lead ───────── */}
      <section id="contact" className="mt-12 scroll-mt-20 overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <div className="grid gap-px bg-border md:grid-cols-2">
          <div className="bg-surface p-8 sm:p-10" style={{ borderTop: `3px solid ${C}` }}>
            <span className="accent-rule mb-3" style={{ color: C }} />
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.8vw,2rem)] font-medium text-text">{tr(v.ctaTitle)}</h2>
            <p className="mt-3 max-w-md text-[0.96rem] text-text-2">{tr(v.ctaBody)}</p>
            <div className="mono mt-6 flex flex-col gap-1 text-[0.8rem] text-text-2">
              <span>{v.domain}</span>
              <span>{tr(t("Part of the RAI Holdings ecosystem", "Thuộc hệ sinh thái RAI Holdings"))}</span>
            </div>
          </div>
          <div className="bg-surface p-8 sm:p-10">
            <LeadForm color={C} source={v.domain} ventureName={v.name} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── lead form ───────────────────────── */
function LeadForm({ color, source, ventureName }: { color: string; source: string; ventureName: string }) {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [err, setErr] = useState<T | null>(null);

  const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3.5 py-2.5 text-[0.92rem] text-text outline-none transition-colors focus:border-text placeholder:text-text-2";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) { setErr(t("Please enter your name.", "Vui lòng nhập tên.")); return; }
    if (!/^[0-9+\s().-]{8,}$/.test(phone) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr(t("Enter a phone number or email so we can reach you.", "Nhập số điện thoại hoặc email để chúng tôi liên hệ.")); return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), source, venture: ventureName }),
      });
      if (!res.ok) throw new Error();
      setState("ok");
    } catch {
      setState("error");
      setErr(t("Something went wrong. Please try again.", "Có lỗi xảy ra. Vui lòng thử lại."));
    }
  }

  if (state === "ok") {
    return (
      <div className="flex h-full flex-col items-center justify-center py-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
          <Icon name="check" size={26} style={{ color }} />
        </span>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-[1.2rem] font-medium text-text">{tr(t("Thank you!", "Cảm ơn bạn!"))}</h3>
        <p className="mt-2 max-w-xs text-[0.9rem] text-text-2">{tr(t("We've received your details and will contact you shortly.", "Chúng tôi đã nhận thông tin và sẽ liên hệ với bạn sớm."))}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="label text-text-2">{tr(t("Register your interest", "Đăng ký quan tâm"))}</label>
      <input className={inp} placeholder={tr(t("Your name", "Họ và tên"))} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <input className={inp} placeholder={tr(t("Phone number", "Số điện thoại"))} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
      <input className={inp} placeholder={tr(t("Email (optional)", "Email (không bắt buộc)"))} value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" autoComplete="email" />
      {err && <p className="text-[0.82rem]" style={{ color: "var(--color-err)" }}>{tr(err)}</p>}
      <button type="submit" disabled={state === "loading"} className={buttonClass("primary", "md") + " w-full"} style={{ background: color, borderColor: color }}>
        {state === "loading" ? tr(t("Sending…", "Đang gửi…")) : tr(t("Send", "Gửi"))}
      </button>
      <p className="text-[0.74rem] text-text-2">{tr(t("By submitting you agree to be contacted about this product.", "Khi gửi, bạn đồng ý được liên hệ về sản phẩm này."))}</p>
    </form>
  );
}

/* ───────────────────────── section title ───────────────────────── */
function SectionTitle({ c, label, title, note }: { c: string; label: T; title: T; note?: T }) {
  const { tr } = useLang();
  return (
    <div className="mb-5">
      <span className="accent-rule mb-3" style={{ color: c }} />
      <span className="label text-text-2">{tr(label)}</span>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.4rem,2.8vw,2rem)] font-medium text-text">{tr(title)}</h2>
      {note && <p className="mt-1.5 text-[0.84rem] text-text-2">{tr(note)}</p>}
    </div>
  );
}
