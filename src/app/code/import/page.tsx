"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { licenses, getLicense, categoryColor, categoryLabels } from "@/lib/code";
import { importRepo } from "@/lib/code-store";
import { useLang, t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function ImportRepo() {
  const { tr } = useLang();
  const router = useRouter();
  const [url, setUrl] = useState("https://github.com/");
  const [detectedLicense, setDetectedLicense] = useState("MIT");
  const name = url.replace(/\/$/, "").split("/").pop() || "imported";
  const lic = getLicense(detectedLicense);

  function confirm() {
    const slug = importRepo({ url, name: name.replace(/[^a-z0-9-]/gi, "-"), license: detectedLicense });
    router.push(`/code/${slug}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <span className="accent-rule mb-4 text-accent" />
      <span className="label text-text-2">{tr(t("Import", "Nhập"))}</span>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.2rem)] font-medium text-text">{tr(t("Import from community", "Nhập từ cộng đồng"))}</h1>
      <p className="mt-3 text-[0.96rem] text-text-2">{tr(t("Import a public Git repo. We read its license and keep an upstream reference — review the terms before confirming.", "Nhập repo Git công khai. Hệ thống đọc giấy phép và giữ tham chiếu nguồn — xem điều khoản trước khi xác nhận."))}</p>

      <div className="mt-7 grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
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

        <button onClick={confirm} className="rounded-[var(--radius-md)] bg-accent px-5 py-3 text-[0.92rem] font-medium text-white">{tr(t("Import repository", "Nhập kho mã"))}</button>
      </div>
    </main>
  );
}

const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[0.78rem] font-medium text-text-2">{label}</span>{children}</label>; }
