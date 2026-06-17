"use client";

import { KpiCard } from "@/components/dash/KpiCard";
import { Panel } from "@/components/dash/Panel";
import { PageHeader, PeriodPill } from "@/components/dash/PageHeader";
import { AreaLine } from "@/components/dash/charts/AreaLine";
import { Funnel } from "@/components/dash/charts/Funnel";
import { Icon } from "@/components/ui/Icon";
import { activity, overviewKpis, ventureFunnel, ventureTrend, trendLabels } from "@/lib/dashboard";
import { entities } from "@/lib/content";
import { toneVar } from "@/components/dash/tone";
import { useLang, t } from "@/lib/i18n";

export default function OverviewPage() {
  const { tr } = useLang();
  return (
    <>
      <PageHeader
        label={t("RAI Holdings OS · Console", "RAI Holdings OS · Console")}
        title={t("System overview", "Tổng quan hệ thống")}
        desc={t(
          "The orchestration layer at a glance — entities, ventures, and the proof metrics.",
          "Toàn cảnh lớp điều phối — pháp nhân, doanh nghiệp và các chỉ số chứng minh.",
        )}
        action={<PeriodPill />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewKpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title={tr(t("Active ventures on the OS", "Doanh nghiệp đang chạy trên OS"))} subtitle="CUMULATIVE // 2026—2027">
          <AreaLine data={ventureTrend} labels={trendLabels} />
        </Panel>

        <Panel title={tr(t("Entities", "Pháp nhân"))} subtitle="4 // ONLINE">
          <ul className="grid gap-2.5">
            {entities.map((e) => (
              <li key={e.code} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border px-3 py-2.5">
                <span className="grid size-8 flex-none place-items-center rounded-[var(--radius-sm)] border" style={{ color: e.color, borderColor: e.color }}>
                  <Icon name={e.icon} size={15} />
                </span>
                <span className="flex-1">
                  <span className="block text-[0.86rem] font-medium text-text">{e.name}</span>
                  <span className="mono block text-[0.66rem] text-text-2">{tr(e.tier)}</span>
                </span>
                <span className="size-1.5 rounded-full" style={{ background: "var(--color-ok)" }} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-1" title={tr(t("Venture funnel", "Phễu doanh nghiệp"))}>
          <Funnel stages={ventureFunnel} />
        </Panel>

        <Panel className="lg:col-span-2" title={tr(t("Activity", "Hoạt động"))}>
          <ul className="grid gap-3.5">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 size-2 flex-none rounded-full" style={{ background: toneVar[a.tone ?? "holdings"] }} />
                <div>
                  <p className="text-[0.86rem] text-text">{tr(a.text)}</p>
                  <span className="mono text-[0.7rem] text-text-2">{tr(a.when)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
