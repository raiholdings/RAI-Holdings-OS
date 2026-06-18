"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { Company, CompanySearchResult } from "@/lib/bigdata";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";
const PER_PAGE = 20;

type TabId = "company" | "realestate" | "market" | "people" | "funding";
const TABS: { id: TabId; label: T; icon: string; ready: boolean }[] = [
  { id: "company", label: t("Company data", "Dữ liệu doanh nghiệp"), icon: "building", ready: true },
  { id: "realestate", label: t("Real estate / Projects", "Bất động sản / Dự án"), icon: "home", ready: false },
  { id: "market", label: t("Industry & Market", "Ngành & Thị trường"), icon: "trending-up", ready: false },
  { id: "people", label: t("People / Founders", "Nhân sự / Nhà sáng lập"), icon: "users", ready: false },
  { id: "funding", label: t("Funding / Investment", "Gọi vốn / Đầu tư"), icon: "coins", ready: false },
];

const fmt = (n: number) => n.toLocaleString("vi-VN");

export function BigDataView({ embedded = false }: { embedded?: boolean }) {
  const { tr, lang, setLang } = useLang();
  const [active, setActive] = useState<TabId>("company");
  const tab = TABS.find((x) => x.id === active)!;

  return (
    <div className={embedded ? "" : "min-h-dvh bg-bg"}>
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
        {!embedded && (
          <div className={`${WRAP} flex h-16 items-center justify-between gap-4`}>
            <div className="flex items-center gap-4"><Link href="/"><Logo /></Link><span className="mono hidden text-[0.7rem] text-text-2 sm:inline">/ BIG DATA</span></div>
            <div className="mono flex items-center overflow-hidden rounded-[var(--radius-md)] border border-border text-[0.72rem]">
              {(["en", "vi"] as const).map((l) => <button key={l} onClick={() => setLang(l)} className={cn("px-2 py-1 uppercase transition-colors", lang === l ? "bg-accent text-white" : "text-text-2 hover:text-text")}>{l}</button>)}
            </div>
          </div>
        )}
        {/* module sub-nav */}
        <div className={`${WRAP} flex gap-0.5 overflow-x-auto`}>
          {TABS.map((x) => (
            <button key={x.id} onClick={() => setActive(x.id)} className={cn("flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-[0.85rem] transition-colors", active === x.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
              <Icon name={x.icon} size={15} />{tr(x.label)}
              {!x.ready && <span className="mono rounded-[var(--radius-md)] bg-surface px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-text-2">{tr(t("Soon", "Sắp có"))}</span>}
            </button>
          ))}
        </div>
      </header>

      <main className={`${WRAP} py-8`}>
        {active === "company" ? <CompanyTab /> : <ComingSoon label={tab.label} icon={tab.icon} />}
      </main>
    </div>
  );
}

function CompanyTab() {
  const { tr } = useLang();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [res, setRes] = useState<CompanySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);

  // debounce input -> query
  useEffect(() => {
    const id = setTimeout(() => { setQuery(input.trim()); setPage(1); }, 450);
    return () => clearTimeout(id);
  }, [input]);

  // fetch on query/page change
  useEffect(() => {
    let alive = true;
    if (query.length < 2) { setRes(null); return; }
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/bigdata/v0/companies?q=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}`);
        const data = (await r.json()) as CompanySearchResult;
        if (alive) setRes(data);
      } catch {
        if (alive) setRes({ data: [], total: 0, page, perPage: PER_PAGE, source: "raicrm.vn", error: "network" });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [query, page]);

  const totalPages = res ? Math.max(1, Math.ceil(res.total / PER_PAGE)) : 1;

  return (
    <div className="space-y-6">
      {/* KPI strip — honest: stated approx total + live result count */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi icon="database" value="~1.000.000" label={t("Companies in dataset", "Doanh nghiệp trong kho")} foot={t("estimated · source raicrm.vn", "ước tính · nguồn raicrm.vn")} />
        <Kpi icon="search" value={res ? fmt(res.total) : "—"} label={t("Matches for this search", "Kết quả khớp tìm kiếm")} foot={query.length < 2 ? t("type to search", "nhập để tìm") : undefined} />
        <Kpi icon="bolt" value="raicrm.vn" label={t("Live sync source", "Nguồn đồng bộ trực tiếp")} foot={t("Perfex CRM API", "Perfex CRM API")} />
      </div>

      {/* search */}
      <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5">
          <Icon name="search" size={16} className="text-text-2" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tr(t("Search by company name or tax code (e.g. FPT, Viettel, 0316…)", "Tra cứu theo tên doanh nghiệp hoặc mã số thuế (vd FPT, Viettel, 0316…)"))}
            className="w-full bg-transparent text-[0.92rem] text-text outline-none placeholder:text-text-2"
          />
          {input && <button onClick={() => setInput("")} aria-label="clear"><Icon name="x" size={15} className="text-text-2 hover:text-text" /></button>}
        </div>
        <p className="mt-2 text-[0.76rem] text-text-2">{tr(t("Tip: avoid very generic terms — search the full name or tax code for precise matches.", "Mẹo: tránh từ quá chung — tìm tên đầy đủ hoặc mã số thuế để khớp chính xác."))}</p>
      </div>

      {/* results */}
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-[0.78rem] text-text-2">
          <span>
            {query.length < 2
              ? tr(t("Enter a keyword to search ~1M Vietnamese companies.", "Nhập từ khoá để tra cứu trong ~1 triệu doanh nghiệp VN."))
              : loading
                ? tr(t("Searching…", "Đang tìm…"))
                : <>{tr(t("Found", "Tìm thấy"))} <b className="text-text">{res ? fmt(res.total) : 0}</b> {tr(t("companies", "doanh nghiệp"))}</>}
          </span>
          <span className="mono">{tr(t("Source", "Nguồn"))}: raicrm.vn</span>
        </div>

        {/* error */}
        {res?.error && (
          <div className="px-5 py-10 text-center text-[0.9rem] text-text-2">
            {res.error === "missing_token"
              ? tr(t("CRM token not configured on the server (set RAICRM_TOKEN).", "Chưa cấu hình token CRM trên máy chủ (đặt RAICRM_TOKEN)."))
              : res.error.startsWith("upstream_5")
                ? tr(t("That keyword returned too many results upstream. Try a more specific term.", "Từ khoá trả về quá nhiều kết quả từ nguồn. Thử từ cụ thể hơn."))
                : tr(t("Couldn't reach the data source. Try again.", "Không kết nối được nguồn dữ liệu. Thử lại."))}
          </div>
        )}

        {/* table */}
        {!res?.error && (
          <>
            <div className="hidden grid-cols-12 gap-3 border-b border-border px-5 py-2.5 text-[0.66rem] font-medium uppercase tracking-wider text-text-2 sm:grid">
              <div className="col-span-5">{tr(t("Company", "Doanh nghiệp"))}</div>
              <div className="col-span-3">{tr(t("Tax code", "Mã số thuế"))}</div>
              <div className="col-span-3">{tr(t("Region", "Khu vực"))}</div>
              <div className="col-span-1" />
            </div>
            <ul className="divide-y divide-border">
              {(res?.data ?? []).map((c) => (
                <li key={c.id}>
                  <button onClick={() => setSelected(c)} className="grid w-full grid-cols-1 items-center gap-2 px-5 py-3.5 text-left transition-colors hover:bg-bg sm:grid-cols-12 sm:gap-3">
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-[0.66rem] font-medium text-accent">{initials(c.name)}</span>
                      <div className="min-w-0">
                        <div className="truncate text-[0.9rem] font-medium text-text">{c.name}</div>
                        <div className="text-[0.7rem] text-text-2">{c.active ? <span className="text-ok">● {tr(t("Active", "Đang hoạt động"))}</span> : <span>● {tr(t("Inactive", "Ngừng"))}</span>}</div>
                      </div>
                    </div>
                    <div className="col-span-3 mono text-[0.78rem] text-text-2">{c.taxCode}</div>
                    <div className="col-span-3 truncate text-[0.8rem] text-text-2">{c.region}</div>
                    <div className="col-span-1 flex justify-end"><Icon name="arrow-up-right" size={15} className="text-text-2" /></div>
                  </button>
                </li>
              ))}
              {query.length >= 2 && !loading && (res?.data.length ?? 0) === 0 && !res?.error && (
                <li className="px-5 py-12 text-center text-[0.9rem] text-text-2">{tr(t("No companies matched. Try another keyword.", "Không có doanh nghiệp khớp. Thử từ khoá khác."))}</li>
              )}
            </ul>
          </>
        )}

        {/* pagination */}
        {res && res.total > PER_PAGE && !res.error && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={cn(buttonClass("outline", "sm"), "disabled:opacity-40")}>{tr(t("Previous", "Trang trước"))}</button>
            <span className="mono text-[0.72rem] text-text-2">{tr(t("Page", "Trang"))} {page}/{totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={cn(buttonClass("outline", "sm"), "disabled:opacity-40")}>{tr(t("Next", "Trang sau"))}</button>
          </div>
        )}
      </div>

      {selected && <CompanyModal company={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CompanyModal({ company, onClose }: { company: Company; onClose: () => void }) {
  const { tr } = useLang();
  const rows: { label: T; value: string; mono?: boolean }[] = [
    { label: t("Tax code", "Mã số thuế"), value: company.taxCode, mono: true },
    { label: t("Region", "Khu vực"), value: company.region },
    { label: t("Address", "Địa chỉ"), value: company.address },
    { label: t("Phone", "Điện thoại"), value: company.phone || "—" },
    { label: t("Added to CRM", "Thêm vào CRM"), value: company.addedAt || "—" },
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[520px] border border-border bg-bg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-[0.78rem] font-medium text-accent">{initials(company.name)}</span>
            <div>
              <div className="text-[1.02rem] font-medium text-text">{company.name}</div>
              <div className="text-[0.74rem]">{company.active ? <span className="text-ok">● {tr(t("Active", "Đang hoạt động"))}</span> : <span className="text-text-2">● {tr(t("Inactive", "Ngừng"))}</span>}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="close"><Icon name="x" size={18} className="text-text-2 hover:text-text" /></button>
        </div>
        <dl className="divide-y divide-border border-y border-border">
          {rows.map((r) => (
            <div key={tr(r.label)} className="grid grid-cols-3 gap-3 py-2.5">
              <dt className="label text-text-2">{tr(r.label)}</dt>
              <dd className={cn("col-span-2 text-[0.86rem] text-text", r.mono && "mono")}>{r.value}</dd>
            </div>
          ))}
        </dl>
        {company.website && (
          <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className={cn(buttonClass("outline", "sm"), "mt-4")}>
            <Icon name="world" size={14} />{tr(t("Visit website", "Mở website"))}
          </a>
        )}
        <p className="mono mt-4 text-[0.66rem] text-text-2">{tr(t("Source", "Nguồn"))}: raicrm.vn · ID {company.id}</p>
      </div>
    </div>
  );
}

function Kpi({ icon, value, label, foot }: { icon: string; value: string; label: T; foot?: T }) {
  const { tr } = useLang();
  return (
    <div className="border border-border bg-surface p-5">
      <span className="mb-3 grid size-9 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-accent"><Icon name={icon} size={18} /></span>
      <div className="text-[1.5rem] font-medium tracking-tight text-text">{value}</div>
      <div className="text-[0.78rem] text-text-2">{tr(label)}</div>
      {foot && <div className="mono mt-1 text-[0.64rem] text-text-2">{tr(foot)}</div>}
    </div>
  );
}

function ComingSoon({ label, icon }: { label: T; icon: string }) {
  const { tr } = useLang();
  return (
    <div className="grid place-items-center border border-dashed border-border bg-surface py-20 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-[var(--radius-md)] bg-bg text-text-2"><Icon name={icon} size={26} /></span>
      <h3 className="text-[1.05rem] font-medium text-text">{tr(label)}</h3>
      <p className="mt-1 max-w-sm text-[0.9rem] text-text-2">{tr(t("This data module is being built. It will connect its own source in a later phase.", "Phân hệ dữ liệu này đang được xây dựng. Sẽ kết nối nguồn riêng ở giai đoạn sau."))}</p>
    </div>
  );
}

function initials(name: string): string {
  const clean = name.replace(/^(công ty|cong ty)\s*(cp|tnhh|cổ phần|co phan)?\s*/i, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || name.slice(0, 2).toUpperCase();
}
