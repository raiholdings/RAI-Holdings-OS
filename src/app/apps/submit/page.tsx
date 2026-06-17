"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { addSubmission, validateSubmission, type SubmissionScope } from "@/lib/apps-store";
import { useLang, t, type T } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const CHECK_LABELS: Record<string, T> = {
  meta: t("Name & description present (≥20 chars)", "Có tên & mô tả (≥20 ký tự)"),
  endpoint: t("Valid MCP endpoint (https…/mcp)", "Endpoint /mcp hợp lệ (https…/mcp)"),
  ui: t("UI resource uses ui:// scheme", "UI resource dùng ui://"),
  fallback: t("Every tool has fallback text", "Mọi tool có fallback text"),
  scopes: t("At least one scope declared", "Khai báo ≥1 scope"),
};

const ICONS = ["home", "sparkles", "bolt", "cart", "database", "robot", "world", "stack"];
const COLORS = ["#2E75B6", "#C9A227", "#0F2A47", "#0F6E56", "#3B6D11", "#378ADD"];

export default function SubmitApp() {
  const { tr } = useLang();
  const [done, setDone] = useState<string | null>(null);
  const [f, setF] = useState({
    name: "", tagline: "", description: "", category: "property" as "property" | "design" | "workflow",
    mcpEndpoint: "https://", uiResourceUri: "ui://", icon: "home", color: "#2E75B6", scopesRaw: "read:data|Đọc dữ liệu", hasFallback: false,
  });

  const scopes = useMemo<SubmissionScope[]>(() =>
    f.scopesRaw.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [id, label] = l.split("|");
      return { id: id.trim(), label: (label || id).trim() };
    }), [f.scopesRaw]);

  const checks = useMemo(() => validateSubmission({ ...f, scopes }), [f, scopes]);
  const allOk = checks.every((c) => c.ok);

  function submit() {
    const id = addSubmission({
      name: f.name, tagline: f.tagline, description: f.description, category: f.category,
      mcpEndpoint: f.mcpEndpoint, uiResourceUri: f.uiResourceUri, icon: f.icon, color: f.color, scopes, hasFallback: f.hasFallback,
    });
    setDone(id);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full" style={{ background: "color-mix(in srgb, var(--color-ok) 14%, transparent)", color: "var(--color-ok)" }}><Icon name="check" size={24} /></span>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[1.3rem] font-medium text-text">{tr(t("Submitted for review", "Đã nộp để duyệt"))}</h1>
        <p className="mono mt-2 text-[0.78rem] text-text-2">{done} · status: submitted</p>
        <p className="mt-3 text-[0.88rem] text-text-2">{tr(t("Reviewers will validate and approve your app. Track it in the review queue.", "Đội duyệt sẽ kiểm tra và phê duyệt ứng dụng. Theo dõi ở hàng đợi duyệt."))}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/apps/review" className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-[0.85rem] font-medium text-white">{tr(t("Go to review queue", "Tới hàng đợi duyệt"))}</Link>
          <button onClick={() => setDone(null)} className="rounded-[var(--radius-md)] border border-border-strong px-4 py-2 text-[0.85rem] text-text">{tr(t("Submit another", "Nộp app khác"))}</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl">
        <span className="accent-rule mb-4 text-accent" />
        <span className="label text-text-2">{tr(t("Phase 4 · Submit & review", "Phase 4 · Nộp & duyệt"))}</span>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.3rem)] font-medium text-text">{tr(t("Submit an app", "Nộp ứng dụng"))}</h1>
        <p className="mt-3 text-[0.98rem] text-text-2">{tr(t("Your app is an MCP server registering a ui:// resource + tools. We validate automatically, then a reviewer approves it into the directory.", "Ứng dụng của bạn là một MCP server đăng ký ui:// resource + tool. Chúng tôi validate tự động, sau đó reviewer duyệt vào thư mục."))}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* form */}
        <div className="grid gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <Field label={tr(t("App name", "Tên ứng dụng"))}><input className={inp} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="RAI Calendar" /></Field>
          <Field label={tr(t("Tagline", "Mô tả ngắn"))}><input className={inp} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></Field>
          <Field label={tr(t("Description", "Mô tả"))}><textarea className={cn(inp, "min-h-[80px]")} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={tr(t("Category", "Danh mục"))}>
              <select className={inp} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as typeof f.category })}>
                <option value="property">{tr(t("Real estate", "Bất động sản"))}</option>
                <option value="design">{tr(t("Design", "Thiết kế"))}</option>
                <option value="workflow">Workflow</option>
              </select>
            </Field>
            <Field label={tr(t("Icon", "Icon"))}>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((ic) => (
                  <button key={ic} type="button" onClick={() => setF({ ...f, icon: ic })} className={cn("grid size-9 place-items-center rounded-[var(--radius-md)] border", f.icon === ic ? "border-accent text-accent" : "border-border text-text-2")}><Icon name={ic} size={17} /></button>
                ))}
              </div>
            </Field>
          </div>
          <Field label={tr(t("Brand color", "Màu thương hiệu"))}>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setF({ ...f, color: c })} className={cn("size-8 rounded-full border-2", f.color === c ? "border-text" : "border-transparent")} style={{ background: c }} />
              ))}
            </div>
          </Field>
          <Field label={tr(t("MCP server endpoint", "Endpoint MCP server"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.mcpEndpoint} onChange={(e) => setF({ ...f, mcpEndpoint: e.target.value })} placeholder="https://app.example.com/mcp" /></Field>
          <Field label={tr(t("UI resource URI", "UI resource URI"))}><input className={cn(inp, "font-[family-name:var(--font-mono)]")} value={f.uiResourceUri} onChange={(e) => setF({ ...f, uiResourceUri: e.target.value })} placeholder="ui://vendor/widget" /></Field>
          <Field label={tr(t("Scopes (one per line: id|label)", "Scope (mỗi dòng: id|nhãn)"))}><textarea className={cn(inp, "min-h-[64px] font-[family-name:var(--font-mono)] text-[0.82rem]")} value={f.scopesRaw} onChange={(e) => setF({ ...f, scopesRaw: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-[0.86rem] text-text">
            <input type="checkbox" checked={f.hasFallback} onChange={(e) => setF({ ...f, hasFallback: e.target.checked })} className="accent-[var(--color-accent)]" />
            {tr(t("I confirm every tool returns fallback text", "Tôi xác nhận mọi tool đều trả fallback text"))}
          </label>
        </div>

        {/* validation panel */}
        <aside className="grid content-start gap-4">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <span className="label text-text-2">{tr(t("Auto-validation", "Validate tự động"))}</span>
            <ul className="mt-3 grid gap-2.5">
              {checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5 text-[0.85rem]">
                  <span className="mt-0.5 flex-none" style={{ color: c.ok ? "var(--color-ok)" : "var(--color-text-2)" }}>
                    <Icon name={c.ok ? "check" : "point"} size={15} />
                  </span>
                  <span className={c.ok ? "text-text" : "text-text-2"}>{tr(CHECK_LABELS[c.id])}</span>
                </li>
              ))}
            </ul>
          </div>
          <button disabled={!allOk} onClick={submit} className={cn("rounded-[var(--radius-md)] px-5 py-3 text-[0.92rem] font-medium text-white transition-colors", allOk ? "bg-accent hover:bg-fund" : "cursor-not-allowed bg-border-strong")}>
            {allOk ? tr(t("Submit for review", "Nộp để duyệt")) : tr(t("Fix validation to submit", "Sửa lỗi để nộp"))}
          </button>
        </aside>
      </div>
    </>
  );
}

const inp = "w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-[0.9rem] text-text outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[0.78rem] font-medium text-text-2">{label}</span>
      {children}
    </label>
  );
}
