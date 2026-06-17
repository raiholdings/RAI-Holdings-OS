"use client";

import Link from "next/link";
import { licenses, categoryLabels, categoryColor, type LicenseCategory } from "@/lib/code";
import { useLang, t } from "@/lib/i18n";

const ORDER: LicenseCategory[] = ["permissive", "copyleft_weak", "copyleft_strong", "source_available", "commercial", "proprietary"];

export default function LicenseCatalog() {
  const { tr } = useLang();
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
      <Link href="/code" className="mono text-[0.74rem] text-text-2 hover:text-text">← {tr(t("Repositories", "Kho mã"))}</Link>
      <span className="accent-rule mb-4 mt-4 text-accent" />
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("License catalog (SPDX)", "Danh mục giấy phép (SPDX)"))}</h1>
      <p className="mt-3 max-w-2xl text-[0.98rem] text-text-2">{tr(t("Six groups from permissive to proprietary, plus RAI licenses. SPDX identifiers are machine-readable. This is reference info, not legal advice.", "Sáu nhóm từ dễ dãi đến độc quyền, cộng giấy phép RAI. Định danh SPDX máy đọc được. Đây là thông tin tham khảo, không thay tư vấn luật."))}</p>

      <div className="mt-8 grid gap-6">
        {ORDER.map((cat) => (
          <section key={cat}>
            <div className="mb-3 flex items-center gap-2"><span className="size-2.5 rounded-[1px]" style={{ background: categoryColor[cat] }} /><h2 className="font-[family-name:var(--font-display)] text-[1.1rem] font-medium text-text">{tr(categoryLabels[cat])}</h2></div>
            <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {licenses.filter((l) => l.category === cat).map((l) => (
                <div key={l.spdxId} className="bg-surface p-5">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[0.84rem] font-medium" style={{ color: categoryColor[cat] }}>{l.spdxId}</span>
                    {l.osiApproved && <span className="mono rounded-[var(--radius-sm)] bg-bg px-1.5 py-0.5 text-[0.58rem] uppercase text-text-2">OSI</span>}
                  </div>
                  <div className="mt-0.5 text-[0.78rem] text-text-2">{l.fullName}</div>
                  <p className="mt-2 text-[0.82rem] text-text">{tr(l.blurb)}</p>
                  <div className="mono mt-3 grid gap-1 text-[0.68rem]">
                    <span style={{ color: "var(--color-ok)" }}>✓ {l.permissions.join(", ")}</span>
                    {l.conditions.length > 0 && <span style={{ color: "var(--color-warn)" }}>⚠ {l.conditions.join(", ")}</span>}
                    {l.limitations.length > 0 && <span style={{ color: "var(--color-err)" }}>✗ {l.limitations.join(", ")}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
