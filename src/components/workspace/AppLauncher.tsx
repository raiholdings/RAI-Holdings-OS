"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { raiAppGroups, type RaiAppItem } from "@/lib/rai-apps";

function Tile({ app, onNav }: { app: RaiAppItem; onNav: () => void }) {
  const { tr } = useLang();
  const inner = (
    <div className="group flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] p-2 text-center transition-colors hover:bg-bg">
      <span className="grid size-12 place-items-center rounded-[var(--radius-lg)] text-white transition-transform group-hover:scale-105" style={{ background: app.color }}>
        <Icon name={app.icon} size={22} />
      </span>
      <span className="line-clamp-2 text-[0.72rem] leading-tight text-text">{tr(app.name)}</span>
    </div>
  );
  return app.external ? (
    <a href={app.href} target="_blank" rel="noreferrer" onClick={onNav}>{inner}</a>
  ) : (
    <Link href={app.href} onClick={onNav}>{inner}</Link>
  );
}

export function AppLauncher() {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={tr(t("RAI apps", "Ứng dụng RAI"))}
        className={cn("grid size-9 place-items-center rounded-[var(--radius-md)] border transition-colors", open ? "border-accent text-accent" : "border-border text-text-2 hover:text-text")}
      >
        <Icon name="grid" size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-[330px] max-h-[78vh] overflow-y-auto rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="grid" size={15} className="text-accent" />
              <span className="text-[0.9rem] font-medium text-text">{tr(t("Explore RAI Workspace", "Khám phá RAI Workspace"))}</span>
            </div>
            {raiAppGroups.map((g) => (
              <div key={tr(g.label)} className="mb-3 last:mb-0">
                <div className="label mb-1 px-1 text-text-2">{tr(g.label)}</div>
                <div className="grid grid-cols-3 gap-1">
                  {g.items.map((app) => <Tile key={tr(app.name) + app.href} app={app} onNav={() => setOpen(false)} />)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
