"use client";

import { Icon } from "@/components/ui/Icon";
import { useLang, t } from "@/lib/i18n";
import { engines } from "@/lib/workspace";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

export default function EnginesPage() {
  const { tr } = useLang();
  return (
    <div className={`${WRAP} py-8`}>
      <div className="label mb-2 text-accent">{tr(t("Venture Builder", "Trình tạo doanh nghiệp"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Engines", "Engine"))}</h1>
      <p className="mt-2 max-w-[640px] text-[0.95rem] text-text-2">
        {tr(
          t(
            "The eight engines that run for every venture, each powered by a RAI solution.",
            "Tám engine chạy cho mỗi doanh nghiệp, mỗi engine dùng một giải pháp RAI."
          )
        )}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {engines.map((eng, i) => (
          <div key={eng.key} className="flex flex-col border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-accent">
                <Icon name={eng.icon} size={18} />
              </span>
              <span className="mono text-[0.66rem] text-text-2">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="text-[1rem] font-medium text-text">{tr(eng.label)}</div>
            <p className="mt-1 text-[0.85rem] text-text-2">{tr(eng.desc)}</p>
            <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2">
              <span className="label text-text-2">{tr(t("Uses", "Dùng"))}</span>
              <span className="mono text-[0.72rem] text-text">{tr(eng.solution)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
