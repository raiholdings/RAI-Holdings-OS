"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { licenses } from "@/lib/code";
import { createRepo, templateLabels, type Template } from "@/lib/code-store";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function NewRepo() {
  const { tr } = useLang();
  const router = useRouter();
  const [f, setF] = useState({ owner: "me", name: "", description: "", template: "react-vite" as Template, license: "MIT", visibility: "public" as "public" | "private" | "internal" });

  function submit() {
    if (!f.name.trim()) return;
    const slug = createRepo({ ...f, name: f.name.trim().replace(/[^a-z0-9-]/gi, "-") });
    router.push(`/code/${slug}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <span className="accent-rule mb-4 text-accent" />
      <span className="label text-text-2">{tr(t("New repository", "Tạo kho mã"))}</span>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.2rem)] font-medium text-text">{tr(t("Create a repository", "Tạo một kho mã"))}</h1>

      <div className="mt-7 grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
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
        <button disabled={!f.name.trim()} onClick={submit} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.92rem] font-medium text-white disabled:opacity-50">{tr(t("Create repository", "Tạo kho mã"))}</button>
      </div>
    </main>
  );
}

const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[0.78rem] font-medium text-text-2">{label}</span>{children}</label>; }
