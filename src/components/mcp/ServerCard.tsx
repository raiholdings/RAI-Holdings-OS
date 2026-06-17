"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { colorForSource, initials, registryMeta, registryStats } from "@/lib/mcp-client";
import { namespaceOf, shortNameOf, type ServerJson } from "@/lib/mcp-registry";
import { useLang, t } from "@/lib/i18n";

export function ServerCard({ server, onInstall }: { server: ServerJson; onInstall: (s: ServerJson) => void }) {
  const { tr } = useLang();
  const meta = registryMeta(server);
  const stats = registryStats(server);
  const ns = namespaceOf(server.name);
  const color = colorForSource(meta.source);
  const href = `/mcp/${ns}/${shortNameOf(server.name)}`;

  return (
    <div className="group flex flex-col bg-surface p-5 transition-colors hover:bg-bg">
      <div className="flex items-start justify-between gap-3">
        <Link href={href} className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 flex-none place-items-center rounded-[var(--radius-md)] font-[family-name:var(--font-display)] text-[0.8rem] font-medium text-white" style={{ background: color }}>
            {initials(server.title)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-[family-name:var(--font-display)] text-[0.98rem] font-medium text-text">{server.title}</span>
            <span className="mono block truncate text-[0.68rem] text-text-2">{server.name}</span>
          </span>
        </Link>
        <button onClick={() => onInstall(server)} className="flex-none rounded-[var(--radius-md)] border border-border-strong px-3 py-1.5 text-[0.78rem] font-medium text-text transition-colors hover:border-text">
          {tr(t("Install", "Cài đặt"))}
        </button>
      </div>
      <p className="mt-3 line-clamp-2 flex-1 text-[0.86rem] text-text-2">{server.description}</p>
      <div className="mono mt-4 flex items-center gap-3 text-[0.72rem] text-text-2">
        <span>By {ns}</span>
        <span className="flex items-center gap-1"><Icon name="bolt" size={12} /> {(stats.installs ?? 0).toLocaleString("en-US")}</span>
        {meta.source === "rai" && <span className="rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[0.6rem] uppercase" style={{ color: "#C9A227", background: "color-mix(in srgb, #C9A227 14%, transparent)" }}>RAI</span>}
      </div>
    </div>
  );
}
