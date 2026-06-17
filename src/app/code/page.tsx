"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { RepoCard } from "@/components/code/RepoCard";
import { fetchRepos } from "@/lib/code-client";
import { useMyRepos } from "@/lib/code-store";
import { licenses, getLicense, type DeployStatus, type Repo } from "@/lib/code";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const PER_PAGE = 9;

export default function CodeExplorer() {
  const { tr } = useLang();
  const mine = useMyRepos();
  const [seed, setSeed] = useState<Repo[]>([]);
  const [q, setQ] = useState("");
  const [lic, setLic] = useState("");
  const [lang, setLang_] = useState("");
  const [status, setStatus] = useState<"" | DeployStatus>("");
  const [page, setPage] = useState(0);

  useEffect(() => { fetchRepos().then(setSeed); }, []);

  const all = useMemo(() => {
    const seen = new Set(seed.map((r) => r.slug));
    return [...seed, ...mine.filter((r) => !seen.has(r.slug))];
  }, [seed, mine]);

  const languages = useMemo(() => Array.from(new Set(all.flatMap((r) => r.language))), [all]);
  const usedLicenses = useMemo(() => licenses.filter((l) => all.some((r) => r.licenseSpdx === l.spdxId)), [all]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((r) => {
      if (lic && r.licenseSpdx !== lic) return false;
      if (lang && !r.language.includes(lang)) return false;
      if (status && r.deployStatus !== status) return false;
      if (needle && !(r.slug + " " + JSON.stringify(r.description)).toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [all, q, lic, lang, status]);

  useEffect(() => { setPage(0); }, [q, lic, lang, status]);
  const items = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <>
      <section className="border-b border-border bg-bg">
        <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-14">
          <span className="accent-rule mb-4 text-accent" />
          <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-[1.06] text-text">{tr(t("Create, reuse & deploy source code", "Tạo, tái sử dụng & triển khai mã nguồn"))}</h1>
          <p className="mt-3 max-w-xl text-[1.02rem] text-text-2">{tr(t("Repositories with SPDX licensing and instant deploy — attach a domain and it runs, all inside RAI OS.", "Kho mã với giấy phép SPDX và triển khai tức thì — gắn tên miền là chạy, ngay trong RAI OS."))}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="/code/new" className="rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-[0.88rem] font-medium text-white">+ {tr(t("Create repository", "Tạo kho mã"))}</Link>
            <Link href="/code/import" className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2.5 text-[0.88rem] text-text">{tr(t("Import from community", "Nhập từ cộng đồng"))}</Link>
            <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3"><Icon name="search" size={16} className="text-text-2" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(t("Search…", "Tìm…"))} className="w-full bg-transparent py-2.5 text-[0.92rem] text-text outline-none placeholder:text-text-2" /></div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[220px_1fr]">
        <aside className="grid h-max gap-6">
          <Group label={tr(t("License", "Giấy phép"))}>
            <Chip active={lic === ""} onClick={() => setLic("")}>{tr(t("All", "Tất cả"))}</Chip>
            {usedLicenses.map((l) => <Chip key={l.spdxId} active={lic === l.spdxId} onClick={() => setLic(l.spdxId)}>{l.spdxId}</Chip>)}
          </Group>
          <Group label={tr(t("Language", "Ngôn ngữ"))}>
            <Chip active={lang === ""} onClick={() => setLang_("")}>{tr(t("All", "Tất cả"))}</Chip>
            {languages.map((l) => <Chip key={l} active={lang === l} onClick={() => setLang_(l)}>{l}</Chip>)}
          </Group>
          <Group label={tr(t("Deploy status", "Trạng thái"))}>
            {([["", t("All", "Tất cả")], ["live", t("Live", "Đang chạy")], ["draft", t("Draft", "Nháp")]] as [typeof status, { en: string; vi: string }][]).map(([s, lbl]) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{tr(lbl)}</Chip>)}
          </Group>
          <Link href="/code/licenses" className="text-[0.82rem] font-medium text-accent">{tr(t("License catalog →", "Danh mục giấy phép →"))}</Link>
        </aside>

        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-[1.15rem] font-medium text-text">{tr(t("All repositories", "Tất cả kho mã"))}</h2>
            <span className="mono text-[0.92rem] text-text-2">{filtered.length}</span>
          </div>
          {items.length === 0 ? (
            <div className="grid place-items-center rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-[0.9rem] text-text-2">{tr(t("No repositories.", "Chưa có kho mã."))}</div>
          ) : (
            <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => <RepoCard key={r.slug} repo={r} />)}
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

function Group({ label, children }: { label: string; children: React.ReactNode }) { return <div><span className="label text-text-2">{label}</span><div className="mt-2 flex flex-wrap gap-1.5">{children}</div></div>; }
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={cn("rounded-[var(--radius-md)] border px-2.5 py-1.5 text-[0.78rem] transition-colors", active ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2 hover:text-text")}>{children}</button>; }
