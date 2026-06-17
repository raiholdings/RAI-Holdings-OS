"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { licenses, getLicense, categoryColor, categoryLabels } from "@/lib/code";
import {
  hydrateStore, useMyRepos, createRepo, importRepo, templateLabels, type Template, type UserRepo,
} from "@/lib/code-store";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";
type Tab = "repos" | "new" | "import";

export default function AdminCode() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>("repos");
  useEffect(() => { hydrateStore(); }, []);
  const repos = useMyRepos();

  const tabs: { id: Tab; label: ReturnType<typeof t>; badge?: number }[] = [
    { id: "repos", label: t("Repositories", "Kho mã"), badge: repos.length },
    { id: "new", label: t("New repository", "Tạo kho mã") },
    { id: "import", label: t("Import", "Nhập") },
  ];

  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · code", "Quản trị · mã nguồn"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Code", "Mã nguồn"))}</h1>
      <div className="accent-rule my-5" />
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)} className={cn("flex items-center gap-2 border-b-2 px-3 py-2 text-[0.88rem] transition-colors", tab === tb.id ? "border-accent text-text" : "border-transparent text-text-2 hover:text-text")}>
            {tr(tb.label)}
            {tb.badge ? <span className="mono rounded-full bg-accent px-1.5 text-[0.62rem] text-white">{tb.badge}</span> : null}
          </button>
        ))}
      </nav>
      {tab === "repos" && <ReposTab repos={repos} onCreate={() => setTab("new")} onImport={() => setTab("import")} />}
      {tab === "new" && <NewTab onDone={() => setTab("repos")} />}
      {tab === "import" && <ImportTab onDone={() => setTab("repos")} />}
    </main>
  );
}

function ReposTab({ repos, onCreate, onImport }: { repos: UserRepo[]; onCreate: () => void; onImport: () => void }) {
  const { tr } = useLang();
  if (repos.length === 0) return (
    <div className="border border-border bg-surface p-8 text-center">
      <p className="mb-4 text-[0.92rem] text-text-2">{tr(t("No repositories yet.", "Chưa có kho mã."))}</p>
      <div className="flex justify-center gap-2">
        <button onClick={onCreate} className={buttonClass("primary", "sm")}><Icon name="check" size={14} />{tr(t("New repository", "Tạo kho mã"))}</button>
        <button onClick={onImport} className={buttonClass("outline", "sm")}>{tr(t("Import", "Nhập"))}</button>
      </div>
    </div>
  );
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left text-[0.86rem]">
        <thead><tr className="bg-surface text-text-2">
          <th className="p-3 font-medium">{tr(t("Repository", "Kho mã"))}</th>
          <th className="p-3 font-medium">{tr(t("Language", "Ngôn ngữ"))}</th>
          <th className="p-3 font-medium">{tr(t("License", "Giấy phép"))}</th>
          <th className="p-3 font-medium">{tr(t("Visibility", "Hiển thị"))}</th>
          <th className="p-3 font-medium">{tr(t("Deploy", "Triển khai"))}</th>
          <th className="p-3 font-medium">{tr(t("Actions", "Hành động"))}</th>
        </tr></thead>
        <tbody>
          {repos.map((r) => (
            <tr key={r.slug} className="border-t border-border align-top">
              <td className="p-3">
                <div className="font-medium text-text">{r.name}</div>
                <div className="mono text-[0.68rem] text-text-2">{r.slug} · {r.sourceOrigin}</div>
              </td>
              <td className="p-3 text-text-2">{r.language.join(", ")}</td>
              <td className="p-3 mono text-[0.74rem] text-text-2">{r.licenseSpdx || "—"}</td>
              <td className="p-3 mono text-[0.74rem] text-text-2">{r.visibility}</td>
              <td className="p-3">
                <span className={cn("mono rounded-[var(--radius-md)] px-1.5 py-0.5 text-[0.62rem] uppercase tracking-wider", r.deployStatus === "live" ? "bg-ok/15 text-ok" : "bg-warn/20 text-warn")}>{r.deployStatus}</span>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/code/${r.slug}`} target="_blank" className={buttonClass("outline", "sm")}>{tr(t("Open", "Mở"))}</Link>
                  {r.deployUrl && <a href={r.deployUrl} target="_blank" rel="noreferrer" className={buttonClass("ghost", "sm")}>{tr(t("Visit", "Xem"))}</a>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[0.78rem] font-medium text-text-2">{label}</span>{children}</label>;
}

function NewTab({ onDone }: { onDone: () => void }) {
  const { tr } = useLang();
  const [f, setF] = useState({ owner: "me", name: "", description: "", template: "react-vite" as Template, license: "MIT", visibility: "public" as "public" | "private" | "internal" });
  const [msg, setMsg] = useState("");

  function submit() {
    if (!f.name.trim()) return;
    const slug = createRepo({ ...f, name: f.name.trim().replace(/[^a-z0-9-]/gi, "-") });
    setMsg(tr(t("Created", "Đã tạo")) + ` ${slug}`);
    setF({ owner: "me", name: "", description: "", template: "react-vite", license: "MIT", visibility: "public" });
  }

  return (
    <div className="max-w-2xl">
      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <Field label={tr(t("Owner", "Chủ sở hữu"))}><input className={inp} value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} /></Field>
          <Field label={tr(t("Repository name", "Tên kho mã"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="my-app" /></Field>
        </div>
        <Field label={tr(t("Description", "Mô tả"))}><input className={inp} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label={tr(t("Template", "Template"))}>
          <div className="flex flex-wrap gap-1.5">{(Object.keys(templateLabels) as Template[]).map((tk) => <button key={tk} onClick={() => setF({ ...f, template: tk })} className={cn("rounded-[var(--radius-md)] border px-3 py-1.5 text-[0.82rem]", f.template === tk ? "border-accent bg-accent/10 text-accent" : "border-border text-text-2")}>{templateLabels[tk]}</button>)}</div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={tr(t("License", "Giấy phép"))}>
            <select className={inp} value={f.license} onChange={(e) => setF({ ...f, license: e.target.value })}>{licenses.map((l) => <option key={l.spdxId} value={l.spdxId}>{l.spdxId}</option>)}</select>
          </Field>
          <Field label={tr(t("Visibility", "Hiển thị"))}>
            <select className={inp} value={f.visibility} onChange={(e) => setF({ ...f, visibility: e.target.value as typeof f.visibility })}><option value="public">public</option><option value="private">private</option><option value="internal">internal</option></select>
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <button disabled={!f.name.trim()} onClick={submit} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.92rem] font-medium text-white disabled:opacity-50">{tr(t("Create repository", "Tạo kho mã"))}</button>
          <button onClick={onDone} className={buttonClass("ghost", "sm")}>{tr(t("Back to list", "Về danh sách"))}</button>
          {msg && <span className="mono text-[0.72rem] text-text-2">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function ImportTab({ onDone }: { onDone: () => void }) {
  const { tr } = useLang();
  const [url, setUrl] = useState("https://github.com/");
  const [detectedLicense, setDetectedLicense] = useState("MIT");
  const [msg, setMsg] = useState("");
  const name = url.replace(/\/$/, "").split("/").pop() || "imported";
  const lic = getLicense(detectedLicense);

  function confirm() {
    const slug = importRepo({ url, name: name.replace(/[^a-z0-9-]/gi, "-"), license: detectedLicense });
    setMsg(tr(t("Imported", "Đã nhập")) + ` ${slug}`);
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-[0.96rem] text-text-2">{tr(t("Import a public Git repo. We read its license and keep an upstream reference — review the terms before confirming.", "Nhập repo Git công khai. Hệ thống đọc giấy phép và giữ tham chiếu nguồn — xem điều khoản trước khi xác nhận."))}</p>
      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <Field label={tr(t("Git URL", "URL Git"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/org/repo" /></Field>
        <Field label={tr(t("Detected license (SPDX)", "Giấy phép phát hiện (SPDX)"))}>
          <select className={inp} value={detectedLicense} onChange={(e) => setDetectedLicense(e.target.value)}>{licenses.map((l) => <option key={l.spdxId} value={l.spdxId}>{l.spdxId}</option>)}</select>
        </Field>

        {lic && (
          <div className="rounded-[var(--radius-md)] border border-border bg-bg p-4">
            <div className="flex items-center gap-2">
              <span className="mono rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.66rem]" style={{ color: categoryColor[lic.category], background: `color-mix(in srgb, ${categoryColor[lic.category]} 12%, transparent)` }}>{tr(categoryLabels[lic.category])}</span>
              <span className="text-[0.88rem] font-medium text-text">{lic.fullName}</span>
            </div>
            <p className="mt-2 text-[0.84rem] text-text-2">{tr(lic.blurb)}</p>
            <div className="mono mt-3 grid gap-1 text-[0.72rem] text-text-2">
              <span style={{ color: "var(--color-ok)" }}>✓ {lic.permissions.join(", ")}</span>
              {lic.conditions.length > 0 && <span style={{ color: "var(--color-warn)" }}>⚠ {lic.conditions.join(", ")}</span>}
              {lic.limitations.length > 0 && <span style={{ color: "var(--color-err)" }}>✗ {lic.limitations.join(", ")}</span>}
            </div>
            {(lic.category === "copyleft_strong" || lic.category === "source_available") && (
              <p className="mt-3 text-[0.78rem]" style={{ color: "var(--color-warn)" }}>{tr(t("Note: reuse restrictions apply — cannot be relicensed as permissive/commercial.", "Lưu ý: có ràng buộc tái sử dụng — không thể đổi sang permissive/thương mại."))}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={confirm} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.92rem] font-medium text-white">{tr(t("Import repository", "Nhập kho mã"))}</button>
          <button onClick={onDone} className={buttonClass("ghost", "sm")}>{tr(t("Back to list", "Về danh sách"))}</button>
          {msg && <span className="mono text-[0.72rem] text-text-2">{msg}</span>}
        </div>
      </div>
    </div>
  );
}
