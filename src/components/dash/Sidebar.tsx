"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { dashNav } from "@/lib/dash-nav";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  const { tr } = useLang();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 grid size-10 place-items-center rounded-[var(--radius-md)] border border-border bg-surface text-text lg:hidden"
        aria-label="Menu"
      >
        <Icon name={open ? "x" : "menu"} size={18} />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-text/20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 ease-[var(--ease-out-soft)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link href="/" className="border-b border-border px-5 py-4">
          <Logo />
        </Link>

        <nav className="flex-1 overflow-y-auto p-3">
          {dashNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "mb-0.5 flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors",
                  active ? "bg-bg text-text" : "text-text-2 hover:bg-bg hover:text-text",
                )}
              >
                <span className={cn("grid size-8 flex-none place-items-center rounded-[var(--radius-sm)] border", active ? "border-accent text-accent" : "border-border text-text-2")}>
                  <Icon name={item.icon} size={16} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[0.88rem] font-medium">{tr(item.label)}</span>
                  <span className="mono text-[0.66rem] text-text-2">{tr(item.desc)}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 flex-none place-items-center rounded-full bg-accent text-[0.8rem] font-medium text-white">PT</span>
            <span className="flex flex-col leading-tight">
              <span className="text-[0.84rem] font-medium text-text">Phạm Văn Thư</span>
              <span className="mono text-[0.66rem] text-text-2">CHIEF ARCHITECT</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
