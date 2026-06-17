"use client";

import { useEffect, useRef, useState } from "react";
import { useLang, t } from "@/lib/i18n";
import { Icon } from "@/components/ui/Icon";
import { AreaLine } from "@/components/dash/charts/AreaLine";
import { Donut } from "@/components/dash/charts/Donut";
import { useHomeMetrics } from "@/components/home/LiveProvider";
import type { Stat } from "@/lib/home";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

function useCountUp(value: number, ms = 600) {
  const [n, setN] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current; const delta = value - start; const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setN(Math.round(start + delta * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step); else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return n;
}

function StatCard({ s }: { s: Stat }) {
  const { tr } = useLang();
  const n = useCountUp(s.value);
  return (
    <div className="border border-border bg-surface p-5" title={`${tr(t("Source", "Nguồn"))}: ${s.source}`}>
      <div className="flex items-start justify-between">
        <div className="label text-text-2">{tr(s.label)}</div>
        {s.stale && <span className="mono rounded-[var(--radius-md)] bg-warn/20 px-1.5 text-[0.58rem] uppercase text-warn">{tr(t("updating", "đang cập nhật"))}</span>}
      </div>
      <div className="mt-2 text-[2rem] font-medium tracking-tight text-text">{n.toLocaleString("en-US")}{s.unit && <span className="ml-1 text-[0.9rem] text-text-2">{tr(s.unit)}</span>}</div>
      <div className="mt-2 h-9"><AreaLine data={s.sparkline} height={36} /></div>
      <div className="mono mt-2 text-[0.6rem] uppercase tracking-wider text-text-2/70">{s.source}</div>
    </div>
  );
}

const actIcon: Record<string, string> = { app: "robot", listing: "cart", deploy: "bolt", company: "building" };

export function LiveDashboard() {
  const { tr, lang } = useLang();
  const { metrics, updatedAt, stale } = useHomeMetrics();
  const donutData = metrics.categoryDistribution.map((c) => ({ label: c.label, value: c.count, tone: c.tone }));
  const hhmm = updatedAt.toLocaleTimeString(lang === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className="border-b border-border bg-bg">
      <div className={`${WRAP} py-16`}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="accent-rule mb-4" />
            <h2 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("The ecosystem, live", "Hệ sinh thái, thời gian thực"))}</h2>
            <p className="mt-2 max-w-xl text-[0.98rem] text-text-2">{tr(t("Real numbers pulled from every platform — apps, servers, listings, deployments, and companies.", "Số liệu thật kéo từ mọi nền tảng — app, server, listing, triển khai và công ty."))}</p>
          </div>
          <div className="mono flex items-center gap-2 text-[0.72rem] text-text-2">
            <span className={`size-2 rounded-full ${stale ? "bg-warn" : "bg-ok"}`} />
            {stale ? tr(t("reconnecting…", "đang kết nối lại…")) : tr(t("updated", "cập nhật"))} {hhmm}
          </div>
        </div>

        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
          {metrics.stats.map((s) => <StatCard key={s.key} s={s} />)}
        </div>

        <div className="mt-px grid gap-px lg:grid-cols-3">
          <div className="border border-border bg-surface p-6 lg:col-span-2">
            <h3 className="mb-4 text-[1.05rem] font-medium text-text">{tr(t("Ecosystem growth", "Tăng trưởng hệ sinh thái"))}</h3>
            <AreaLine data={metrics.total} labels={metrics.growthLabels} height={200} />
          </div>
          <div className="border border-border bg-surface p-6">
            <h3 className="mb-4 text-[1.05rem] font-medium text-text">{tr(t("By category", "Theo danh mục"))}</h3>
            <Donut data={donutData} />
          </div>
        </div>

        <div className="mt-px border border-border bg-surface p-6">
          <h3 className="mb-4 text-[1.05rem] font-medium text-text">{tr(t("Recent activity", "Hoạt động gần đây"))}</h3>
          {metrics.recentActivity.length === 0 ? <p className="text-[0.9rem] text-text-2">{tr(t("No recent activity.", "Chưa có hoạt động."))}</p> : (
            <ul className="divide-y divide-border">
              {metrics.recentActivity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-8 place-items-center rounded-[var(--radius-md)] border border-border text-accent"><Icon name={actIcon[a.type] ?? "point"} size={15} /></span>
                  <span className="text-[0.9rem] text-text">{a.title}</span>
                  <span className="mono ml-auto text-[0.68rem] uppercase tracking-wider text-text-2">{tr(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
