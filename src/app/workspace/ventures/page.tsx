"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { VentureStatus } from "@/lib/workspace";
import { hydrateStore, useAllVentures, useCurrentOrgId } from "@/lib/workspace-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

const STATUS_LABEL: Record<VentureStatus, T> = {
  draft: t("Draft", "Nháp"),
  designing: t("Designing", "Đang thiết kế"),
  simulating: t("Simulating", "Đang mô phỏng"),
  experimenting: t("Experimenting", "Đang thử nghiệm"),
  live: t("Live", "Hoạt động"),
  archived: t("Archived", "Lưu trữ"),
};

function statusClass(s: VentureStatus): string {
  if (s === "live") return "bg-ok/15 text-ok";
  if (s === "archived") return "bg-bg text-text-2";
  if (s === "draft") return "bg-bg text-text-2";
  return "bg-accent/10 text-accent";
}

export default function VenturesPage() {
  const { tr } = useLang();
  const orgId = useCurrentOrgId();
  const all = useAllVentures();
  const ventures = all.filter((v) => v.orgId === orgId);

  useEffect(() => { hydrateStore(); }, []);

  return (
    <main className={`${WRAP} py-8`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="label mb-2 text-accent">{tr(t("RAI OS Workspace", "RAI OS Workspace"))}</div>
          <h1 className="text-[1.6rem] font-medium tracking-tight text-text">{tr(t("Ventures", "Doanh nghiệp"))}</h1>
          <p className="mt-1 text-[0.9rem] text-text-2">{tr(t("Ventures built by the 8-agent pipeline.", "Các doanh nghiệp dựng bởi pipeline 8 tác nhân."))}</p>
        </div>
        <Link href="/workspace" className={buttonClass("primary", "sm")}>
          <Icon name="sparkles" size={15} /> {tr(t("New venture", "Doanh nghiệp mới"))}
        </Link>
      </div>

      {ventures.length === 0 ? (
        <div className="grid place-items-center border border-border bg-surface p-12 text-center">
          <Icon name="building" size={28} className="mb-3 text-text-2" />
          <h2 className="text-[1.1rem] font-medium text-text">{tr(t("No ventures yet", "Chưa có doanh nghiệp"))}</h2>
          <p className="mt-1 mb-5 max-w-[420px] text-[0.9rem] text-text-2">{tr(t("Describe an idea and the pipeline will build the first venture for you.", "Mô tả một ý tưởng và pipeline sẽ dựng doanh nghiệp đầu tiên cho bạn."))}</p>
          <Link href="/workspace" className={buttonClass("primary", "sm")}>
            <Icon name="arrow-up-right" size={15} /> {tr(t("Build your first venture", "Dựng doanh nghiệp đầu tiên"))}
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ventures.map((v) => (
            <Link
              key={v.id}
              href={`/workspace/ventures/${v.id}`}
              className="flex flex-col border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-[1rem] font-medium leading-snug text-text">{v.name}</span>
                <span className={cn("mono shrink-0 rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wider", statusClass(v.status))}>
                  {tr(STATUS_LABEL[v.status])}
                </span>
              </div>
              <div className="text-[0.8rem] text-text-2">{v.sector} · {v.region}</div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                <span className="mono rounded-[var(--radius-md)] bg-accent/10 px-1.5 py-0.5 text-[0.66rem] text-accent">
                  {v.confidence}% {tr(t("confidence", "tin cậy"))}
                </span>
                <span className="mono text-[0.66rem] text-text-2">{new Date(v.createdAt).toLocaleDateString("en-GB")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
