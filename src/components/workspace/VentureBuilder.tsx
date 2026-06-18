"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { engines, sampleIdeas, type Venture } from "@/lib/workspace";
import { useAllVentures, useCurrentOrgId } from "@/lib/workspace-store";
import { raiAppGroups, type RaiAppItem } from "@/lib/rai-apps";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

const statusLabel: Record<Venture["status"], T> = {
  draft: t("Draft", "Nháp"),
  designing: t("Designing", "Đang thiết kế"),
  simulating: t("Simulating", "Đang mô phỏng"),
  experimenting: t("Experimenting", "Đang thử nghiệm"),
  live: t("Live", "Đang chạy"),
  archived: t("Archived", "Lưu trữ"),
};

export function VentureBuilder() {
  const { tr } = useLang();
  const router = useRouter();
  const [text, setText] = useState("");

  const orgId = useCurrentOrgId();
  const allVentures = useAllVentures();
  const recent = useMemo(
    () => allVentures.filter((v) => v.orgId === orgId).slice(0, 6),
    [allVentures, orgId]
  );

  function submit() {
    const idea = text.trim();
    if (!idea) return;
    router.push("/workspace/build?idea=" + encodeURIComponent(idea));
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className={`${WRAP} py-8`}>
      {/* hero */}
      <div className="mb-2">
        <div className="label mb-2 text-accent">{tr(t("Venture Builder", "Trình tạo doanh nghiệp"))}</div>
        <h1 className="text-[1.7rem] font-medium tracking-tight text-text">
          {tr(t("Describe an idea — RAI builds the venture", "Mô tả ý tưởng — RAI tạo lập doanh nghiệp"))}
        </h1>
        <p className="mt-2 max-w-[640px] text-[0.95rem] text-text-2">
          {tr(
            t(
              "An 8-engine pipeline turns one prompt into market signals, a business blueprint, a simulation and live experiments.",
              "Pipeline 8 engine biến một câu mô tả thành tín hiệu thị trường, mô hình kinh doanh, mô phỏng và thử nghiệm thực tế."
            )
          )}
        </p>
      </div>

      <div className="mt-5 border border-border bg-surface p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={4}
          placeholder={tr(t("Describe the company you want to build…", "Mô tả công ty bạn muốn xây…"))}
          className="w-full resize-y bg-transparent text-[1rem] text-text outline-none placeholder:text-text-2"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="mono text-[0.7rem] text-text-2">⌘/Ctrl + ↵</span>
          <button onClick={submit} disabled={!text.trim()} className={buttonClass("primary", "md")}>
            <Icon name="bolt" size={16} />
            {tr(t("Build the venture", "Tạo lập doanh nghiệp"))}
          </button>
        </div>
      </div>

      {/* sample chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {sampleIdeas.map((idea) => (
          <button
            key={idea.en}
            onClick={() => setText(tr(idea))}
            className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-1.5 text-[0.82rem] text-text-2 transition-colors hover:border-border-strong hover:text-text"
          >
            {tr(idea)}
          </button>
        ))}
      </div>

      {/* engine preview chain */}
      <div className="mt-10">
        <h2 className="text-[0.8rem] font-medium uppercase tracking-wider text-text-2">
          {tr(t("The 8-engine pipeline", "Pipeline 8 engine"))}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {engines.map((eng, i) => (
            <div key={eng.key} className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-accent">
                  <Icon name={eng.icon} size={15} />
                </span>
                <span className="text-[0.82rem] font-medium text-text">{tr(eng.label)}</span>
              </div>
              {i < engines.length - 1 && <span className="text-text-2">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* recent ventures */}
      <div className="mt-10">
        <h2 className="text-[1.1rem] font-medium tracking-tight text-text">
          {tr(t("Recent ventures", "Doanh nghiệp gần đây"))}
        </h2>
        {recent.length === 0 ? (
          <div className="mt-3 border border-dashed border-border bg-surface p-8 text-center">
            <p className="text-[0.9rem] text-text-2">
              {tr(
                t(
                  "No ventures yet — describe an idea above to build your first one.",
                  "Chưa có doanh nghiệp — mô tả một ý tưởng ở trên để tạo lập cái đầu tiên."
                )
              )}
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((v) => (
              <Link
                key={v.id}
                href={`/workspace/ventures/${v.id}`}
                className="flex flex-col border border-border bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="text-[0.98rem] font-medium text-text">{v.name}</span>
                  <span
                    className={cn(
                      "mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider",
                      v.confidence >= 70 ? "bg-ok/15 text-ok" : v.confidence >= 50 ? "bg-accent/10 text-accent" : "bg-bg text-text-2"
                    )}
                  >
                    {v.confidence}%
                  </span>
                </div>
                <div className="text-[0.78rem] text-text-2">
                  {v.sector} · {v.region}
                </div>
                <div className="mt-3 border-t border-border pt-2">
                  <span className="mono text-[0.66rem] uppercase tracking-wider text-text-2">{tr(statusLabel[v.status])}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* RAI platforms — Google-Marketplace-style grid */}
      <div className="mt-12">
        <h2 className="text-[1.1rem] font-medium tracking-tight text-text">{tr(t("RAI platforms", "Nền tảng RAI"))}</h2>
        <p className="mt-1 text-[0.88rem] text-text-2">{tr(t("Every RAI app, in one place.", "Tất cả ứng dụng RAI, ở một nơi."))}</p>
        {raiAppGroups.map((g) => (
          <div key={g.label.en} className="mt-6">
            <div className="label mb-2 text-text-2">{tr(g.label)}</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {g.items.map((app) => <AppCard key={tr(app.name) + app.href} app={app} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppCard({ app }: { app: RaiAppItem }) {
  const { tr } = useLang();
  const body = (
    <div className="group flex h-full flex-col border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] text-white" style={{ background: app.color }}>
          <Icon name={app.icon} size={22} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[0.95rem] font-medium text-text">{tr(app.name)}</div>
          <div className="text-[0.7rem] text-text-2">RAI{app.external ? " · " + tr(t("external", "ngoài")) : ""}</div>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 flex-1 text-[0.82rem] text-text-2">{tr(app.desc)}</p>
      <div className="mt-3 flex items-center gap-1 text-[0.8rem] font-medium text-accent">
        {app.external ? tr(t("Open", "Mở")) : tr(t("Open", "Mở"))}
        <Icon name="arrow-up-right" size={14} />
      </div>
    </div>
  );
  return app.external
    ? <a href={app.href} target="_blank" rel="noreferrer">{body}</a>
    : <Link href={app.href}>{body}</Link>;
}
