"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { categories, type AppCategory, type RaiApp } from "@/lib/apps";
import { useDirectoryApps, useConnections } from "@/lib/apps-store";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function AppsDirectory() {
  const { tr } = useLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<AppCategory | "all">("all");
  const all = useDirectoryApps();
  const connections = useConnections();

  const featured = all.filter((a) => a.featured);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (!needle) return true;
      return (a.name + " " + tr(a.tagline) + " " + tr(a.description)).toLowerCase().includes(needle);
    });
  }, [q, cat, tr, all]);

  return (
    <>
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("MCP Apps · SEP-1865", "MCP Apps · SEP-1865"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.6rem)] font-medium text-text">
          {tr(t("Apps that run inside the conversation", "Ứng dụng chạy ngay trong hội thoại"))}
        </h1>
        <p className="mt-3 text-[1.02rem] text-text-2">
          {tr(t("Connect an app and its interface renders directly in chat — no install, no app store. Each app is an MCP server registering a UI resource and tools.", "Kết nối một ứng dụng và giao diện của nó render thẳng trong hội thoại — không cài đặt, không app store. Mỗi ứng dụng là một MCP server đăng ký UI resource và tool."))}
        </p>
      </div>

      {/* featured */}
      <section className="mt-10">
        <span className="label text-text-2">{tr(t("Featured", "Nổi bật"))}</span>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {featured.map((a) => <FeatureCard key={a.id} app={a} />)}
        </div>
      </section>

      {/* search + filter */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
          <Icon name="search" size={16} className="text-text-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr(t("Search apps…", "Tìm ứng dụng…"))}
            className="w-full bg-transparent py-2.5 text-[0.92rem] text-text outline-none placeholder:text-text-2"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn("rounded-[var(--radius-md)] border px-3 py-2 text-[0.82rem] transition-colors", cat === c.id ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2 hover:text-text")}
            >
              {tr(c.label)}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      <div className="mt-5 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => <AppCard key={a.id} app={a} connected={!!connections[a.id]} />)}
        {filtered.length === 0 && (
          <div className="bg-surface p-10 text-center text-[0.9rem] text-text-2 sm:col-span-2 lg:col-span-3">
            {tr(t("No apps match your search.", "Không có ứng dụng nào khớp."))}
          </div>
        )}
      </div>
    </>
  );
}

function AppCard({ app, connected }: { app: RaiApp; connected: boolean }) {
  const { tr } = useLang();
  return (
    <Link href={`/apps/${app.id}`} className="group flex flex-col bg-surface p-5 transition-colors hover:bg-bg">
      <div className="flex items-center gap-3">
        <span className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: app.color, background: `color-mix(in srgb, ${app.color} 12%, transparent)` }}>
          <Icon name={app.icon} size={22} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-[1rem] font-medium text-text">{app.name}</span>
            {app.community && <span className="mono rounded-[var(--radius-sm)] bg-bg px-1.5 py-0.5 text-[0.6rem] uppercase text-text-2">community</span>}
          </div>
          <div className="mono text-[0.68rem] uppercase tracking-wide text-text-2">{tr(app.categoryLabel)}</div>
        </div>
      </div>
      <p className="mt-3 flex-1 text-[0.86rem] text-text-2">{tr(app.tagline)}</p>
      {connected ? (
        <span className="mt-4 inline-flex items-center gap-1.5 text-[0.84rem] font-medium" style={{ color: "var(--color-ok)" }}>
          <Icon name="check" size={14} /> {tr(t("Connected", "Đã kết nối"))}
        </span>
      ) : (
        <span className="mt-4 inline-flex items-center gap-1 text-[0.84rem] font-medium" style={{ color: app.color }}>
          {tr(t("Connect", "Kết nối"))} <Icon name="arrow-up-right" size={14} />
        </span>
      )}
    </Link>
  );
}

function FeatureCard({ app }: { app: RaiApp }) {
  const { tr } = useLang();
  return (
    <Link href={`/apps/${app.id}`} className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6 transition-colors hover:border-border-strong" style={{ borderTopColor: app.color, borderTopWidth: 2 }}>
      <span className="grid size-12 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: app.color, background: `color-mix(in srgb, ${app.color} 12%, transparent)` }}>
        <Icon name={app.icon} size={24} />
      </span>
      <div>
        <div className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{app.name}</div>
        <p className="mt-1 text-[0.88rem] text-text-2">{tr(app.tagline)}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-[0.82rem] font-medium" style={{ color: app.color }}>
          {tr(t("Open", "Mở"))} <Icon name="arrow-up-right" size={13} />
        </span>
      </div>
    </Link>
  );
}
