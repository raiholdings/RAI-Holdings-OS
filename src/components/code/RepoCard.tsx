"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getLicense, categoryColor, type Repo } from "@/lib/code";
import { useLang, t } from "@/lib/i18n";

export function RepoCard({ repo }: { repo: Repo }) {
  const { tr } = useLang();
  const lic = getLicense(repo.licenseSpdx);
  const licColor = lic ? categoryColor[lic.category] : "var(--color-text-2)";
  return (
    <Link href={`/code/${repo.owner}/${repo.name}`} className="group flex h-full flex-col bg-surface p-5 transition-colors hover:bg-bg">
      <div className="flex items-start justify-between gap-3">
        <span className="font-[family-name:var(--font-display)] text-[0.98rem] font-medium text-text">
          <span className="text-text-2">{repo.owner}/</span>{repo.name}
        </span>
        <span className="mono flex flex-none items-center gap-1 text-[0.72rem]" style={{ color: repo.deployStatus === "live" ? "var(--color-ok)" : "var(--color-text-2)" }}>
          {repo.deployStatus === "live" ? "🌐" : "⏸"} {repo.deployStatus}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 flex-1 text-[0.86rem] text-text-2">{tr(repo.description)}</p>
      <div className="mono mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-text-2">
        {repo.language[0] && <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{ background: "var(--color-holdings)" }} /> {repo.language[0]}</span>}
        <span className="rounded-[var(--radius-sm)] px-1.5 py-0.5" style={{ color: licColor, background: `color-mix(in srgb, ${licColor} 12%, transparent)` }}>{repo.licenseSpdx}</span>
        <span className="flex items-center gap-0.5">★ {repo.starCount}</span>
      </div>
    </Link>
  );
}
