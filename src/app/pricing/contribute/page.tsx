"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getPricingPage } from "@/lib/pricing";
import { hydrateStore, submitContribution } from "@/lib/pricing-store";

const WRAP = "mx-auto max-w-[760px] px-5 sm:px-8";

export default function Contribute() {
  const { tr } = useLang();
  const plans = getPricingPage().plans;
  const [planKey, setPlanKey] = useState(plans[0]?.key ?? "free");
  const [name, setName] = useState("");
  const [ctype, setCtype] = useState<"user" | "partner" | "opc">("user");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rationale, setRationale] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => { hydrateStore(); }, []);

  function submit() {
    if (!name.trim() || !content.trim()) return;
    submitContribution({ planKey, name: name.trim(), contributorType: ctype, title: title.trim(), content: content.trim(), rationale: rationale.trim() });
    setDone(true);
  }

  const field = "w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-[0.92rem] text-text outline-none focus:border-border-strong";
  const lbl = "label mb-1.5 block text-text-2";

  return (
    <main className="bg-bg">
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-14`}>
          <div className="label mb-4 text-accent">{tr(t("Community", "Cộng đồng"))}</div>
          <div className="accent-rule mb-6" />
          <h1 className="text-[2rem] font-medium tracking-tight text-text">{tr(t("Suggest a pricing update", "Đề xuất cập nhật bảng giá"))}</h1>
          <p className="mt-4 text-[1rem] text-text-2">{tr(t("Propose a feature or clarification for a plan. Every suggestion enters the review queue; a human approves before anything changes — and AI never sets prices.", "Đề xuất một tính năng hoặc làm rõ cho một gói. Mọi đề xuất vào hàng đợi duyệt; người duyệt xác nhận trước khi đổi — và AI không bao giờ tự đặt giá."))}</p>
        </div>
      </section>

      <section className={`${WRAP} py-12`}>
        {done ? (
          <div className="border border-ok/40 bg-surface p-8 text-center">
            <Icon name="check" size={28} className="mx-auto text-ok" />
            <h2 className="mt-3 text-[1.2rem] font-medium text-text">{tr(t("Submitted for review", "Đã gửi để duyệt"))}</h2>
            <p className="mt-2 text-[0.94rem] text-text-2">{tr(t("Thanks — reviewers see it in the pricing admin console.", "Cảm ơn — người duyệt thấy nó trong bảng quản trị giá."))}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => { setDone(false); setTitle(""); setContent(""); setRationale(""); }} className={buttonClass("outline")}>{tr(t("Submit another", "Gửi tiếp"))}</button>
              <Link href="/admin/pricing" className={buttonClass("primary")}>{tr(t("Open review queue", "Mở hàng đợi duyệt"))}</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 border border-border bg-surface p-6 sm:p-8">
            <div>
              <label className={lbl}>{tr(t("Target plan", "Gói áp dụng"))}</label>
              <select value={planKey} onChange={(e) => setPlanKey(e.target.value)} className={field}>{plans.map((p) => <option key={p.key} value={p.key}>{p.name.en}</option>)}</select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={lbl}>{tr(t("Your name / org", "Tên / tổ chức"))}</label><input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Acme Co." /></div>
              <div><label className={lbl}>{tr(t("You are a", "Bạn là"))}</label><select value={ctype} onChange={(e) => setCtype(e.target.value as "user" | "partner" | "opc")} className={field}><option value="user">{tr(t("Customer / user", "Khách hàng"))}</option><option value="partner">{tr(t("Partner", "Đối tác"))}</option><option value="opc">{tr(t("OPC", "OPC"))}</option></select></div>
            </div>
            <div><label className={lbl}>{tr(t("Feature title", "Tiêu đề tính năng"))}</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder={tr(t("e.g. Bulk export", "vd Xuất hàng loạt"))} /></div>
            <div><label className={lbl}>{tr(t("Description", "Mô tả"))}</label><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className={field} placeholder={tr(t("What should this plan include or clarify?", "Gói này nên có gì hoặc cần làm rõ điều gì?"))} /></div>
            <div><label className={lbl}>{tr(t("Why this helps (optional)", "Vì sao hữu ích (tùy chọn)"))}</label><input value={rationale} onChange={(e) => setRationale(e.target.value)} className={field} /></div>
            <div className="flex justify-end"><button onClick={submit} disabled={!name.trim() || !content.trim()} className={buttonClass("primary", "lg")}>{tr(t("Submit for review", "Gửi để duyệt"))}<Icon name="send" size={16} /></button></div>
          </div>
        )}
      </section>
    </main>
  );
}
