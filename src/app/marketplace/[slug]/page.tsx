"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { PricingTable } from "@/components/marketplace/PricingTable";
import { fetchListing, type ListingWithPub } from "@/lib/marketplace-client";
import { typeLabels, categoryLabels, compatLabels, type PricingPlan } from "@/lib/marketplace";
import { useMyListings, usePublisher, useSubFor, subscribe, changeSub } from "@/lib/marketplace-store";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

function artifactHref(ref: ListingWithPub["artifactRef"]): string | null {
  if (ref.kind === "app") return `/apps/${ref.id}`;
  if (ref.kind === "mcp") return `/mcp/${ref.id.split("/")[0]}/${ref.id.split("/").slice(1).join("/")}`;
  return null;
}

export default function ListingDetail() {
  const { tr } = useLang();
  const { slug } = useParams<{ slug: string }>();
  const myListings = useMyListings();
  const myPublisher = usePublisher();
  const sub = useSubFor(slug);
  const [listing, setListing] = useState<ListingWithPub | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    let off = false;
    fetchListing(slug).then((l) => {
      if (off) return;
      if (l) { setListing(l); setState("ok"); return; }
      const p = myListings.find((x) => x.slug === slug && x.status === "approved");
      if (p) { setListing({ ...p, publisher: myPublisher ?? undefined }); setState("ok"); } else setState("missing");
    });
    return () => { off = true; };
  }, [slug, myListings, myPublisher]);

  if (state === "loading") return <Wrap><p className="py-20 text-center text-text-2">{tr(t("Loading…", "Đang tải…"))}</p></Wrap>;
  if (state === "missing" || !listing) return <Wrap><p className="py-20 text-center text-text-2">{tr(t("Listing not found.", "Không tìm thấy listing."))} <Link href="/marketplace" className="font-medium text-accent">← Marketplace</Link></p></Wrap>;

  const aHref = artifactHref(listing.artifactRef);

  function onSelect(plan: PricingPlan) {
    if (sub) changeSub(sub.id, plan, cycle); // upgrade now / downgrade end-of-cycle
    else subscribe(listing!, plan, cycle);
  }

  return (
    <Wrap>
      <Link href="/marketplace" className="mono text-[0.74rem] text-text-2 transition-colors hover:text-text">← Marketplace</Link>

      <header className="mt-4 flex flex-wrap items-start gap-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6 sm:p-8" style={{ borderTopColor: listing.color, borderTopWidth: 3 }}>
        <span className="grid size-16 flex-none place-items-center rounded-[var(--radius-lg)]" style={{ color: listing.color, background: `color-mix(in srgb, ${listing.color} 12%, transparent)` }}><Icon name={listing.icon} size={32} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2.1rem)] font-medium text-text">{listing.name}</h1>
            <span className="mono rounded-[var(--radius-sm)] bg-bg px-2 py-0.5 text-[0.62rem] uppercase text-text-2">{tr(typeLabels[listing.type])}</span>
          </div>
          <p className="mt-1 text-[1rem] text-text-2">{tr(listing.tagline)}</p>
          <div className="mono mt-2 flex flex-wrap items-center gap-3 text-[0.72rem] text-text-2">
            <span className="flex items-center gap-1">{listing.publisher?.name}{listing.publisher?.verified && <Icon name="check" size={11} style={{ color: "var(--color-ok)" }} />}</span>
            <span>★ {listing.rating.toFixed(1)}</span>
            <span className="flex items-center gap-0.5"><Icon name="bolt" size={11} /> {listing.installCount.toLocaleString("en-US")}</span>
            {aHref && <Link href={aHref} className="flex items-center gap-1 text-accent"><Icon name="arrow-up-right" size={11} /> {tr(t("Technical artifact", "Artifact kỹ thuật"))}</Link>}
          </div>
        </div>
        {sub && <span className="flex-none rounded-[var(--radius-md)] px-3 py-2 text-[0.82rem] font-medium" style={{ color: "var(--color-ok)", background: "color-mix(in srgb, var(--color-ok) 12%, transparent)" }}>✓ {sub.status === "trialing" ? tr(t("Trialing", "Đang dùng thử")) : tr(t("Installed", "Đã cài"))} · {sub.planName}</span>}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <Section title={tr(t("About", "Giới thiệu"))}><p className="text-[0.95rem] leading-relaxed text-text">{tr(listing.description)}</p></Section>
          <Section title={tr(t("Categories & compatibility", "Danh mục & tương thích"))}>
            <div className="flex flex-wrap gap-2">
              {listing.categories.map((c) => <Tag key={c}>{tr(categoryLabels[c])}</Tag>)}
              {listing.compatibility.map((c) => <Tag key={c} mono>{tr(compatLabels[c])}</Tag>)}
            </div>
          </Section>
          <Section title={tr(t("Reviews", "Đánh giá"))}>
            <div className="grid gap-3">
              {[{ n: "Nguyễn Hà", r: 5, q: tr(t("Saved my team hours every week.", "Tiết kiệm cho team tôi hàng giờ mỗi tuần.")) }, { n: "Trần Minh", r: 4, q: tr(t("Solid, does exactly what it says.", "Chắc chắn, làm đúng như mô tả.")) }].map((rv) => (
                <div key={rv.n} className="rounded-[var(--radius-md)] border border-border bg-bg p-3">
                  <div className="flex items-center justify-between"><span className="text-[0.85rem] font-medium text-text">{rv.n}</span><span className="mono text-[0.74rem]" style={{ color: "var(--color-accent)" }}>{"★".repeat(rv.r)}</span></div>
                  <p className="mt-1 text-[0.84rem] text-text-2">{rv.q}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <aside>
          <div className="mb-3 flex items-center justify-between">
            <span className="label text-text-2">{tr(t("Plans", "Gói"))}</span>
            <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
              {(["monthly", "yearly"] as const).map((c) => <button key={c} onClick={() => setCycle(c)} className={cn("px-2.5 py-1 transition-colors", cycle === c ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{tr(c === "monthly" ? t("Monthly", "Tháng") : t("Yearly", "Năm"))}</button>)}
            </div>
          </div>
          <PricingTable listing={listing} publisher={listing.publisher} cycle={cycle} currentPlanId={sub?.planId} onSelect={onSelect} />
          {sub && <p className="mt-3 text-center text-[0.8rem] text-text-2">{tr(t("Manage in", "Quản lý ở"))} <Link href="/marketplace/billing" className="font-medium text-accent">{tr(t("Billing", "Thanh toán"))}</Link></p>}
        </aside>
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">{children}</main>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6"><span className="label text-text-2">{title}</span><div className="mt-3">{children}</div></section>;
}
function Tag({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return <span className={cn("rounded-[var(--radius-sm)] border border-border bg-bg px-2.5 py-1 text-[0.78rem] text-text-2", mono && "font-[family-name:var(--font-mono)]")}>{children}</span>;
}
