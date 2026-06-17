"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { fetchListings, type ListingWithPub } from "@/lib/marketplace-client";
import { useMyListings, usePublisher } from "@/lib/marketplace-store";
import { typeLabels, categoryLabels, compatLabels, type Category, type Compatibility, type ListingType } from "@/lib/marketplace";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const PER_PAGE = 9;

export default function Marketplace() {
  const { tr } = useLang();
  const myListings = useMyListings();
  const publisher = usePublisher();
  const [all, setAll] = useState<ListingWithPub[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ListingType | "">("");
  const [cat, setCat] = useState<Category | "">("");
  const [price, setPrice] = useState<"" | "free" | "paid" | "trial">("");
  const [compat, setCompat] = useState<Compatibility | "">("");
  const [verified, setVerified] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => { fetchListings().then(setAll); }, []);

  const merged = useMemo(() => {
    const pub = myListings.filter((l) => l.status === "approved").map((l) => ({ ...l, publisher: publisher ?? undefined })) as ListingWithPub[];
    const seen = new Set(all.map((l) => l.slug));
    return [...all, ...pub.filter((l) => !seen.has(l.slug))];
  }, [all, myListings, publisher]);

  const priceBadge = (l: ListingWithPub) => {
    if (price === "free") return l.plans.some((p) => p.type === "free");
    if (price === "paid") return l.plans.some((p) => p.type !== "free");
    if (price === "trial") return l.plans.some((p) => p.hasFreeTrial);
    return true;
  };
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return merged.filter((l) => {
      if (type && l.type !== type) return false;
      if (cat && !l.categories.includes(cat)) return false;
      if (compat && !l.compatibility.includes(compat)) return false;
      if (verified && !l.publisher?.verified) return false;
      if (!priceBadge(l)) return false;
      if (needle && !(l.name + " " + JSON.stringify(l.tagline)).toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [merged, q, type, cat, compat, verified, price]);

  useEffect(() => { setPage(0); }, [q, type, cat, price, compat, verified]);
  const pageItems = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const featured = merged.filter((l) => l.featured);
  const models = merged.filter((l) => l.type === "mcp_server");

  return (
    <>
      {/* hero + search */}
      <section className="border-b border-border bg-bg">
        <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16">
          <span className="accent-rule mb-4 text-accent" />
          <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.06] text-text">
            {tr(t("Extend your workflow with tools", "Mở rộng quy trình của bạn với tiện ích"))}
          </h1>
          <p className="mt-3 max-w-xl text-[1.02rem] text-text-2">{tr(t("Apps, MCP servers, and workflows from RAI and partners to automate your work.", "Ứng dụng, MCP server và workflow từ RAI và đối tác để tự động hóa công việc."))}</p>
          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
            <Icon name="search" size={16} className="text-text-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(t("Search the marketplace…", "Tìm kiếm marketplace…"))} className="w-full bg-transparent py-3 text-[0.95rem] text-text outline-none placeholder:text-text-2" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[220px_1fr]">
        {/* sidebar filters */}
        <aside className="grid h-max gap-6">
          <FilterGroup label={tr(t("Type", "Loại"))}>
            <Chip active={type === ""} onClick={() => setType("")}>{tr(t("All", "Tất cả"))}</Chip>
            {(Object.keys(typeLabels) as ListingType[]).map((tk) => <Chip key={tk} active={type === tk} onClick={() => setType(tk)}>{tr(typeLabels[tk])}</Chip>)}
          </FilterGroup>
          <FilterGroup label={tr(t("Category", "Danh mục"))}>
            <Chip active={cat === ""} onClick={() => setCat("")}>{tr(t("All", "Tất cả"))}</Chip>
            {(Object.keys(categoryLabels) as Category[]).map((ck) => <Chip key={ck} active={cat === ck} onClick={() => setCat(ck)}>{tr(categoryLabels[ck])}</Chip>)}
          </FilterGroup>
          <FilterGroup label={tr(t("Price", "Giá"))}>
            {([["", t("All", "Tất cả")], ["free", t("Free", "Miễn phí")], ["paid", t("Paid", "Trả phí")], ["trial", t("Free trial", "Dùng thử")]] as [typeof price, T][]).map(([pk, lbl]) => <Chip key={pk} active={price === pk} onClick={() => setPrice(pk)}>{tr(lbl)}</Chip>)}
          </FilterGroup>
          <FilterGroup label={tr(t("Compatibility", "Tương thích"))}>
            <Chip active={compat === ""} onClick={() => setCompat("")}>{tr(t("All", "Tất cả"))}</Chip>
            {(Object.keys(compatLabels) as Compatibility[]).map((ck) => <Chip key={ck} active={compat === ck} onClick={() => setCompat(ck)}>{tr(compatLabels[ck])}</Chip>)}
          </FilterGroup>
          <label className="flex items-center gap-2 text-[0.84rem] text-text">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="accent-[var(--color-accent)]" />
            {tr(t("Verified publishers", "Nhà phát hành xác thực"))}
          </label>
        </aside>

        {/* main */}
        <div>
          {/* rails (only when no active filter/search) */}
          {!q && !type && !cat && !price && !compat && !verified && (
            <>
              <Rail title={tr(t("Models & MCP servers", "Model & MCP server"))} items={models} />
              <Rail title={tr(t("Featured apps", "Ứng dụng nổi bật"))} items={featured} />
            </>
          )}

          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-[1.15rem] font-medium text-text">{tr(t("All listings", "Tất cả listing"))}</h2>
            <span className="mono text-[0.92rem] text-text-2">{filtered.length}</span>
          </div>

          {pageItems.length === 0 ? (
            <div className="grid place-items-center rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-[0.9rem] text-text-2">{tr(t("No listings match.", "Không có listing phù hợp."))}</div>
          ) : (
            <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((l) => <ListingCard key={l.slug} listing={l} />)}
            </div>
          )}

          {filtered.length > PER_PAGE && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className={cn("rounded-[var(--radius-md)] border border-border px-4 py-2 text-[0.85rem]", page === 0 ? "cursor-not-allowed text-text-2/50" : "text-text hover:border-text")}>← {tr(t("Previous", "Trước"))}</button>
              <span className="mono px-3 text-[0.82rem] text-text-2">{page + 1} / {Math.ceil(filtered.length / PER_PAGE)}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * PER_PAGE >= filtered.length} className={cn("rounded-[var(--radius-md)] border border-border px-4 py-2 text-[0.85rem]", (page + 1) * PER_PAGE >= filtered.length ? "cursor-not-allowed text-text-2/50" : "text-text hover:border-text")}>{tr(t("Next", "Sau"))} →</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="label text-text-2">{label}</span><div className="mt-2 flex flex-wrap gap-1.5">{children}</div></div>;
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("rounded-[var(--radius-md)] border px-2.5 py-1.5 text-[0.8rem] transition-colors", active ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2 hover:text-text")}>{children}</button>;
}
function Rail({ title, items }: { title: string; items: ListingWithPub[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((l) => <div key={l.slug} className="w-[260px] flex-none rounded-[var(--radius-lg)] border border-border"><ListingCard listing={l} /></div>)}
      </div>
    </section>
  );
}
