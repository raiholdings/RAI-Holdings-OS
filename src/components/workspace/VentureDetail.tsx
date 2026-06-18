"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { Venture, VentureStatus, Experiment } from "@/lib/workspace";
import { hydrateStore, useVenture } from "@/lib/workspace-store";

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
  if (s === "archived" || s === "draft") return "bg-bg text-text-2";
  return "bg-accent/10 text-accent";
}

const EXP_STATUS: Record<Experiment["status"], { label: T; cls: string }> = {
  planned: { label: t("Planned", "Dự kiến"), cls: "bg-bg text-text-2" },
  running: { label: t("Running", "Đang chạy"), cls: "bg-accent/10 text-accent" },
  done: { label: t("Done", "Hoàn tất"), cls: "bg-ok/15 text-ok" },
};

type TabId = "overview" | "opportunity" | "blueprint" | "simulation" | "experiments" | "revenue" | "learning";
const TABS: { id: TabId; label: T; icon: string }[] = [
  { id: "overview", label: t("Overview", "Tổng quan"), icon: "layout" },
  { id: "opportunity", label: t("Opportunity", "Cơ hội"), icon: "target" },
  { id: "blueprint", label: t("Blueprint", "Mô hình"), icon: "stack" },
  { id: "simulation", label: t("Simulation", "Mô phỏng"), icon: "trending-up" },
  { id: "experiments", label: t("Experiments", "Thử nghiệm"), icon: "bolt" },
  { id: "revenue", label: t("Revenue", "Doanh thu"), icon: "coins" },
  { id: "learning", label: t("Learning", "Học hỏi"), icon: "robot" },
];

function Bar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function VentureDetail({ id }: { id: string }) {
  const { tr } = useLang();
  const v = useVenture(id);
  const [active, setActive] = useState<TabId>("overview");

  useEffect(() => { hydrateStore(); }, []);

  if (!v) {
    return (
      <main className={`${WRAP} py-8`}>
        <div className="grid place-items-center border border-border bg-surface p-12 text-center">
          <Icon name="building" size={28} className="mb-3 text-text-2" />
          <h1 className="text-[1.2rem] font-medium text-text">{tr(t("Venture not found", "Không tìm thấy doanh nghiệp"))}</h1>
          <Link href="/workspace/ventures" className="mt-4 text-[0.86rem] text-accent hover:underline">
            {tr(t("Back to ventures", "Về danh sách doanh nghiệp"))}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`${WRAP} py-8`}>
      {/* Header */}
      <div className="mb-6">
        <Link href="/workspace/ventures" className="mb-3 inline-flex items-center gap-1 text-[0.8rem] text-text-2 hover:text-text">
          <Icon name="arrow-up-right" size={13} className="rotate-180" /> {tr(t("Ventures", "Doanh nghiệp"))}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[1.6rem] font-medium tracking-tight text-text">{v.name}</h1>
          <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wider", statusClass(v.status))}>
            {tr(STATUS_LABEL[v.status])}
          </span>
          <span className="mono rounded-[var(--radius-md)] bg-accent/10 px-1.5 py-0.5 text-[0.66rem] text-accent">
            {v.confidence}% {tr(t("confidence", "tin cậy"))}
          </span>
        </div>
        <div className="mt-1 text-[0.86rem] text-text-2">{v.sector} · {v.region}</div>
        <p className="mt-2 max-w-[680px] text-[0.86rem] text-text-2">
          <span className="label mr-1 text-text-2">{tr(t("Idea", "Ý tưởng"))}</span>{v.ideaPrompt}
        </p>
        <div className="mono mt-1 text-[0.66rem] text-text-2">{new Date(v.createdAt).toLocaleString("en-GB")}</div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-0.5 overflow-x-auto border-b border-border">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => setActive(x.id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-[0.85rem] transition-colors",
              active === x.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text",
            )}
          >
            <Icon name={x.icon} size={15} />{tr(x.label)}
          </button>
        ))}
      </div>

      {active === "overview" && <OverviewTab v={v} />}
      {active === "opportunity" && <OpportunityTab v={v} />}
      {active === "blueprint" && <BlueprintTab v={v} />}
      {active === "simulation" && <SimulationTab v={v} />}
      {active === "experiments" && <ExperimentsTab v={v} />}
      {active === "revenue" && <RevenueTab v={v} />}
      {active === "learning" && <LearningTab v={v} />}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[0.8rem] font-medium uppercase tracking-wider text-text-2">{children}</h2>;
}

// ---- Overview -------------------------------------------------------------
function OverviewTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <SectionTitle>{tr(t("Market signals", "Tín hiệu thị trường"))}</SectionTitle>
        <div className="space-y-2">
          {v.signals.map((s) => (
            <div key={s.id} className="border border-border bg-surface p-4">
              <div className="mono mb-1 text-[0.64rem] uppercase tracking-wider text-text-2">{s.source}</div>
              <div className="text-[0.88rem] text-text">{s.content}</div>
              {s.metadata && <div className="mono mt-1 text-[0.62rem] text-text-2">{s.metadata}</div>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>{tr(t("Knowledge", "Tri thức"))}</SectionTitle>
        <div className="space-y-2">
          {v.knowledge.map((k) => (
            <div key={k.id} className="border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.9rem] font-medium text-text">{k.topic}</span>
                <span className="mono text-[0.66rem] text-text-2">{k.confidence}%</span>
              </div>
              <p className="mt-1 mb-2 text-[0.84rem] text-text-2">{k.insight}</p>
              <Bar value={k.confidence} />
            </div>
          ))}
        </div>
        <div className="mt-4 border border-border bg-surface p-4">
          <SectionTitle>{tr(t("Summary", "Tóm tắt"))}</SectionTitle>
          <p className="text-[0.86rem] text-text-2">
            {tr(t("Sector", "Ngành"))} <span className="text-text">{v.sector}</span> · {tr(t("Region", "Khu vực"))} <span className="text-text">{v.region}</span> · {v.opportunities.length} {tr(t("opportunities", "cơ hội"))} · {v.experiments.length} {tr(t("experiments", "thử nghiệm"))} · {v.confidence}% {tr(t("confidence", "tin cậy"))}.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Opportunity ----------------------------------------------------------
function OpportunityTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-[0.84rem]">
        <thead>
          <tr className="bg-surface text-text-2">
            <th className="p-3 font-medium">{tr(t("Opportunity", "Cơ hội"))}</th>
            <th className="p-3 font-medium">{tr(t("Market size", "Quy mô"))}</th>
            <th className="p-3 font-medium">{tr(t("Demand", "Nhu cầu"))}</th>
            <th className="p-3 font-medium">{tr(t("Competition", "Cạnh tranh"))}</th>
            <th className="p-3 font-medium">{tr(t("Confidence", "Tin cậy"))}</th>
          </tr>
        </thead>
        <tbody>
          {v.opportunities.map((o) => (
            <tr key={o.id} className="border-t border-border align-middle">
              <td className="p-3 text-text">{o.title}</td>
              <td className="p-3 mono text-text-2">{o.marketSize}</td>
              <td className="w-32 p-3"><div className="mono mb-1 text-[0.66rem] text-text-2">{o.demandScore}</div><Bar value={o.demandScore} /></td>
              <td className="w-32 p-3"><div className="mono mb-1 text-[0.66rem] text-text-2">{o.competitionScore}</div><Bar value={o.competitionScore} /></td>
              <td className="w-32 p-3"><div className="mono mb-1 text-[0.66rem] text-text-2">{o.confidenceScore}</div><Bar value={o.confidenceScore} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Blueprint ------------------------------------------------------------
function BlueprintTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  const b = v.blueprint;
  const rows: { l: T; val: string }[] = [
    { l: t("Customer segment", "Phân khúc khách hàng"), val: b.customerSegment },
    { l: t("Value proposition", "Giá trị cốt lõi"), val: b.valueProposition },
    { l: t("Pricing", "Định giá"), val: b.pricing },
    { l: t("Revenue model", "Mô hình doanh thu"), val: b.revenueModel },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.l.en} className="border border-border bg-surface p-4">
          <div className="label mb-1 text-text-2">{tr(r.l)}</div>
          <div className="text-[0.9rem] text-text">{r.val}</div>
        </div>
      ))}
      <div className="border border-border bg-surface p-4 sm:col-span-2">
        <div className="label mb-2 text-text-2">{tr(t("Channel strategy", "Kênh tiếp cận"))}</div>
        <div className="flex flex-wrap gap-1.5">
          {b.channelStrategy.map((c) => (
            <span key={c} className="mono rounded-[var(--radius-md)] bg-bg px-2 py-1 text-[0.7rem] text-text-2">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Simulation -----------------------------------------------------------
function SimulationTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  const s = v.simulation;
  const stats: { l: T; val: string }[] = [
    { l: t("Revenue potential", "Tiềm năng doanh thu"), val: s.revenuePotential },
    { l: t("CAC", "CAC"), val: s.cac },
    { l: t("LTV", "LTV"), val: s.ltv },
    { l: t("Conversion rate", "Tỉ lệ chuyển đổi"), val: s.conversionRate },
    { l: t("Break-even", "Hòa vốn"), val: s.breakEven },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((st) => (
        <div key={st.l.en} className="bg-surface p-4">
          <div className="label text-text-2">{tr(st.l)}</div>
          <div className="mono mt-1 text-[0.95rem] text-text">{st.val}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Experiments ----------------------------------------------------------
function ExperimentsTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {v.experiments.map((e) => {
        const meta = EXP_STATUS[e.status];
        return (
          <div key={e.id} className="flex flex-col border border-border bg-surface p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="text-[0.92rem] font-medium leading-snug text-text">{e.hypothesis}</span>
              <span className={cn("mono shrink-0 rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wider", meta.cls)}>
                {tr(meta.label)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[0.8rem]">
              <div><span className="label text-text-2">{tr(t("Budget", "Ngân sách"))}</span><div className="mono text-text">{e.budget}</div></div>
              <div><span className="label text-text-2">{tr(t("Target", "Mục tiêu"))}</span><div className="text-text">{e.targetMetric}</div></div>
            </div>
            <div className="mt-2 border-t border-border pt-2 text-[0.8rem]">
              <span className="label text-text-2">{tr(t("Result", "Kết quả"))}</span> <span className="text-text">{e.result}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Revenue --------------------------------------------------------------
function RevenueTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  const max = Math.max(1, ...v.revenue.map((r) => r.count));
  return (
    <div>
      <SectionTitle>{tr(t("Revenue pipeline", "Pipeline doanh thu"))}</SectionTitle>
      <div className="space-y-2">
        {v.revenue.map((r, i) => (
          <div key={r.stage} className="flex items-center gap-4 border border-border bg-surface p-3">
            <span className="mono w-5 text-center text-[0.78rem] text-text-2">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.88rem] font-medium text-text">{r.stage}</span>
                <span className="mono text-[0.7rem] text-text-2">{r.count} · {r.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Learning -------------------------------------------------------------
function LearningTab({ v }: { v: Venture }) {
  const { tr } = useLang();
  if (v.learning.length === 0) {
    return <p className="text-[0.88rem] text-text-2">{tr(t("No learning records yet.", "Chưa có ghi nhận học hỏi."))}</p>;
  }
  return (
    <div className="space-y-2">
      {v.learning.map((l) => (
        <div key={l.id} className="border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Icon name="sparkles" size={15} className="text-accent" />
            <span className="text-[0.9rem] font-medium text-text">{l.outcome}</span>
          </div>
          <p className="mt-1 text-[0.86rem] text-text-2">{l.lessons}</p>
        </div>
      ))}
    </div>
  );
}
