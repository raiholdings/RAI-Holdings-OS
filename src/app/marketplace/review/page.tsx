"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useMyListings, usePublisher, updateListing } from "@/lib/marketplace-store";
import { typeLabels, formatVnd, type Listing, type ListingStatus } from "@/lib/marketplace";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const statusTone: Record<ListingStatus, string> = {
  approved: "var(--color-ok)", submitted: "var(--color-holdings)", in_review: "var(--color-warn)", rejected: "var(--color-err)", suspended: "var(--color-text-2)",
};
const checks: { key: string; label: T }[] = [
  { key: "scope", label: t("Clearly scoped & honest description", "Phạm vi rõ & mô tả trung thực") },
  { key: "price", label: t("Pricing valid (month + year)", "Giá hợp lệ (tháng + năm)") },
  { key: "nodupe", label: t("Not a confusing duplicate", "Không trùng lặp gây nhầm") },
];

export default function MarketReview() {
  const { tr } = useLang();
  const listings = useMyListings();
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Phase 4 · Review", "Phase 4 · Duyệt"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("Listing review", "Duyệt niêm yết"))}</h1>
        <p className="mt-3 text-[0.98rem] text-text-2">{tr(t("Validate artifact + pricing, run the checklist, and approve listings onto the marketplace.", "Kiểm tra artifact + giá, chạy checklist, và duyệt listing lên marketplace."))}</p>
      </div>
      {listings.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center text-[0.9rem] text-text-2">{tr(t("No submissions.", "Chưa có niêm yết."))} <Link href="/marketplace/publish" className="font-medium text-accent">{tr(t("Publish one →", "Niêm yết →"))}</Link></div>
      ) : (
        <div className="mt-8 grid gap-4">{listings.map((l) => <ReviewCard key={l.id} l={l} />)}</div>
      )}
    </main>
  );
}

function ReviewCard({ l }: { l: Listing }) {
  const { tr } = useLang();
  const publisher = usePublisher();
  const [ck, setCk] = useState<Record<string, boolean>>({});
  const paid = l.plans.find((p) => p.type !== "free");
  const autoOk = (!paid || (paid.priceMonthly > 0 && paid.priceYearly > 0 && !!publisher?.verified)) && !!l.artifactRef.id;
  const canApprove = autoOk && checks.every((c) => ck[c.key]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid size-11 flex-none place-items-center rounded-[var(--radius-md)]" style={{ color: l.color, background: `color-mix(in srgb, ${l.color} 12%, transparent)` }}><Icon name={l.icon} size={22} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{l.name || tr(t("(untitled)", "(chưa đặt tên)"))}</h3>
            <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.62rem] uppercase" style={{ color: statusTone[l.status], background: `color-mix(in srgb, ${statusTone[l.status]} 12%, transparent)` }}>{l.status}</span>
            <span className="mono rounded-[var(--radius-sm)] bg-bg px-1.5 py-0.5 text-[0.58rem] uppercase text-text-2">{tr(typeLabels[l.type])}</span>
          </div>
          <p className="mt-0.5 text-[0.85rem] text-text-2">{tr(l.tagline)}</p>
          <p className="mono mt-1 text-[0.7rem] text-text-2">{l.artifactRef.kind}:{l.artifactRef.id} · {l.plans.map((p) => p.type === "free" ? "free" : formatVnd(p.priceMonthly) + "/mo").join(" · ")}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Auto checks", "Kiểm tra tự động"))}</span>
          <ul className="mono mt-2 grid gap-1.5 text-[0.74rem]">
            <Auto ok={!!l.artifactRef.id}>artifact ref</Auto>
            <Auto ok={!paid || (paid.priceMonthly > 0 && paid.priceYearly > 0)}>paid month+year</Auto>
            <Auto ok={!paid || !!publisher?.verified}>verified for paid</Auto>
          </ul>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
          <span className="label text-text-2">{tr(t("Checklist", "Checklist"))}</span>
          <ul className="mt-2 grid gap-2">{checks.map((c) => <li key={c.key}><label className="flex items-start gap-2 text-[0.82rem] text-text"><input type="checkbox" disabled={l.status === "approved"} checked={!!ck[c.key]} onChange={(e) => setCk((s) => ({ ...s, [c.key]: e.target.checked }))} className="mt-0.5 accent-[var(--color-accent)]" />{tr(c.label)}</label></li>)}</ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {l.status === "submitted" && <button onClick={() => updateListing(l.id, { status: "in_review" })} className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.84rem] font-medium text-white">{tr(t("Start review", "Bắt đầu duyệt"))}</button>}
        {(l.status === "submitted" || l.status === "in_review") && <>
          <button disabled={!canApprove} onClick={() => updateListing(l.id, { status: "approved" })} className={cn("rounded-[var(--radius-md)] px-4 py-2 text-[0.84rem] font-medium text-white", canApprove ? "" : "cursor-not-allowed opacity-50")} style={{ background: "var(--color-ok)" }}>{tr(t("Approve", "Duyệt"))}</button>
          <button onClick={() => updateListing(l.id, { status: "rejected" })} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reject", "Từ chối"))}</button>
        </>}
        {l.status === "approved" && <>
          <span className="text-[0.84rem]" style={{ color: "var(--color-ok)" }}>✓ {tr(t("Live", "Đã lên kệ"))} · <Link href={`/marketplace/${l.slug}`} className="font-medium underline">/{l.slug}</Link></span>
          <button onClick={() => updateListing(l.id, { status: "suspended" })} className="rounded-[var(--radius-md)] border border-border-strong px-3 py-1.5 text-[0.8rem] text-text">{tr(t("Suspend", "Đình chỉ"))}</button>
        </>}
        {(l.status === "rejected" || l.status === "suspended") && <button onClick={() => updateListing(l.id, { status: "in_review" })} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.84rem] text-text">{tr(t("Reopen", "Mở lại"))}</button>}
        {!canApprove && (l.status === "submitted" || l.status === "in_review") && <span className="text-[0.76rem] text-text-2">{tr(t("Pass auto-checks + checklist to approve.", "Qua auto-check + checklist mới duyệt."))}</span>}
      </div>
    </div>
  );
}

function Auto({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <li className="flex items-center gap-2" style={{ color: ok ? "var(--color-ok)" : "var(--color-err)" }}><Icon name={ok ? "check" : "x"} size={13} /> {children}</li>;
}
