"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { engines } from "@/lib/workspace";
import { RaiLLMs } from "@/lib/llms-client";
import { hydrateStore, createVenture } from "@/lib/workspace-store";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

type Status = "pending" | "running" | "done";

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

export function BuildRunner({ idea }: { idea: string | null }) {
  const { tr } = useLang();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>(() => engines.map(() => "pending"));
  const started = useRef(false);

  useEffect(() => { hydrateStore(); }, []);

  useEffect(() => {
    // Run exactly once (the `started` ref also guards against React StrictMode's
    // dev double-mount). We deliberately do NOT cancel on cleanup so the pipeline
    // completes through to createVenture + redirect.
    if (started.current || !idea) return;
    started.current = true;

    (async () => {
      const client = new RaiLLMs();
      for (let i = 0; i < engines.length; i++) {
        setStatuses((s) => s.map((v, j) => (j === i ? "running" : v)));
        try {
          // Live feel — mock gateway call (ignore failures; cosmetic only).
          await client.chat({
            model: "anthropic/claude-sonnet-4.6",
            messages: [{ role: "user", content: `${engines[i].label.en} step for venture idea: ${idea}` }],
          });
        } catch { /* mock — ignore */ }
        await sleep(500);
        setStatuses((s) => s.map((v, j) => (j === i ? "done" : v)));
      }
      const venture = createVenture(idea);
      router.push("/workspace/ventures/" + venture.id);
    })();
  }, [idea, router]);

  if (!idea) {
    return (
      <main className={`${WRAP} py-8`}>
        <div className="grid place-items-center border border-border bg-surface p-12 text-center">
          <Icon name="sparkles" size={28} className="mb-3 text-text-2" />
          <h1 className="text-[1.2rem] font-medium text-text">{tr(t("No idea provided", "Chưa có ý tưởng"))}</h1>
          <p className="mt-1 mb-5 text-[0.9rem] text-text-2">{tr(t("Start from the workspace to describe your venture idea.", "Bắt đầu từ workspace để mô tả ý tưởng doanh nghiệp."))}</p>
          <Link href="/workspace" className={buttonClass("primary", "sm")}>
            <Icon name="arrow-up-right" size={15} /> {tr(t("Go to workspace", "Tới workspace"))}
          </Link>
        </div>
      </main>
    );
  }

  const done = statuses.filter((s) => s === "done").length;
  const allDone = done === engines.length;

  return (
    <main className={`${WRAP} py-8`}>
      <div className="mb-6">
        <div className="label mb-2 text-accent">{tr(t("Building venture", "Đang dựng doanh nghiệp"))}</div>
        <h1 className="text-[1.55rem] font-medium tracking-tight text-text">{tr(t("8-agent orchestration", "Điều phối 8 tác nhân"))}</h1>
        <p className="mt-2 max-w-[680px] text-[0.92rem] text-text-2">{tr(t("Idea", "Ý tưởng"))}: <span className="text-text">{idea}</span></p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${(done / engines.length) * 100}%` }} />
          </div>
          <span className="mono text-[0.72rem] text-text-2">{done}/{engines.length}</span>
        </div>
      </div>

      <div className="space-y-2">
        {engines.map((e, i) => {
          const st = statuses[i];
          return (
            <div
              key={e.key}
              className={cn(
                "flex items-center gap-4 border bg-surface p-4 transition-colors",
                st === "running" ? "border-accent" : "border-border",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-[var(--radius-md)]",
                  st === "done" ? "bg-ok/15 text-ok" : st === "running" ? "bg-accent/10 text-accent" : "bg-bg text-text-2",
                )}
              >
                <Icon name={e.icon} size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[0.95rem] font-medium text-text">{tr(e.label)}</span>
                  <span className="mono rounded-[var(--radius-md)] bg-bg px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wider text-text-2">{tr(e.solution)}</span>
                </div>
                <div className="text-[0.8rem] text-text-2">{tr(e.desc)}</div>
              </div>
              <span className="shrink-0">
                {st === "done" && <Icon name="check" size={18} className="text-ok" />}
                {st === "running" && (
                  <span className="block size-4 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-label="running" />
                )}
                {st === "pending" && <Icon name="point" size={14} className="text-text-2 opacity-40" />}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link href="/workspace" className="text-[0.84rem] text-text-2 hover:text-text">
          {tr(t("Cancel", "Hủy"))}
        </Link>
        {allDone && (
          <span className="mono text-[0.78rem] text-ok">{tr(t("Done — opening venture…", "Hoàn tất — đang mở doanh nghiệp…"))}</span>
        )}
      </div>
    </main>
  );
}
