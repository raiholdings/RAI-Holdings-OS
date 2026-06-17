"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { pageRefs, type BlockType } from "@/lib/enterprise";
import { hydrateStore, submitContribution } from "@/lib/enterprise-store";

const WRAP = "mx-auto max-w-[760px] px-5 sm:px-8";
const CONTRIB_BLOCKS: { type: BlockType; label: ReturnType<typeof t> }[] = [
  { type: "proof", label: t("Case study / testimonial", "Case study / lời chứng thực") },
  { type: "faq", label: t("FAQ entry", "Câu hỏi FAQ") },
  { type: "pain_solution", label: t("Pain → solution", "Vấn đề → giải pháp") },
];

export default function Contribute() {
  const { tr } = useLang();
  const refs = pageRefs();
  const [pageId, setPageId] = useState(`${refs[0]?.axis}-${refs[0]?.slug}`);
  const [blockType, setBlockType] = useState<BlockType>("proof");
  const [name, setName] = useState("");
  const [ctype, setCtype] = useState<"user" | "partner" | "opc">("user");
  const [content, setContent] = useState("");
  const [rationale, setRationale] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { hydrateStore(); }, []);

  function submit() {
    if (!name.trim() || !content.trim()) return;
    submitContribution({ pageId, blockType, name: name.trim(), contributorType: ctype, content: content.trim(), rationale: rationale.trim() });
    setDone(true);
  }

  const field = "w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-[0.92rem] text-text outline-none focus:border-border-strong";
  const lbl = "label mb-1.5 block text-text-2";

  return (
    <main className="bg-bg">
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-14`}>
          <div className="label mb-4 text-accent">{tr(t("Community & enterprise", "Cộng đồng & doanh nghiệp"))}</div>
          <div className="accent-rule mb-6" />
          <h1 className="text-[2rem] font-medium tracking-tight text-text">{tr(t("Contribute content or contact us", "Đóng góp nội dung hoặc liên hệ"))}</h1>
          <p className="mt-4 text-[1rem] text-text-2">{tr(t("Partners, OPCs, and customers can propose content for an Enterprise page — a case study, an FAQ, or a pain/solution. Every submission goes into the review queue; a human approves before anything goes live.", "Đối tác, OPC và khách hàng có thể đề xuất nội dung cho một trang Enterprise — case study, FAQ, hay vấn đề/giải pháp. Mọi đề xuất vào hàng đợi duyệt; người duyệt xác nhận trước khi đăng."))}</p>
        </div>
      </section>

      <section className={`${WRAP} py-12`}>
        {done ? (
          <div className="border border-ok/40 bg-surface p-8 text-center">
            <Icon name="check" size={28} className="mx-auto text-ok" />
            <h2 className="mt-3 text-[1.2rem] font-medium text-text">{tr(t("Submitted for review", "Đã gửi để duyệt"))}</h2>
            <p className="mt-2 text-[0.94rem] text-text-2">{tr(t("Thanks — your contribution is now in the review queue. Reviewers see it in the admin console.", "Cảm ơn — đóng góp của bạn đã vào hàng đợi duyệt. Người duyệt thấy nó trong bảng quản trị."))}</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => { setDone(false); setContent(""); setRationale(""); }} className={buttonClass("outline")}>{tr(t("Submit another", "Gửi tiếp"))}</button>
              <Link href="/admin/enterprise" className={buttonClass("primary")}>{tr(t("Open review queue", "Mở hàng đợi duyệt"))}</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 border border-border bg-surface p-6 sm:p-8">
            <div>
              <label className={lbl}>{tr(t("Target page", "Trang đích"))}</label>
              <select value={pageId} onChange={(e) => setPageId(e.target.value)} className={field}>
                {refs.map((r) => <option key={r.url} value={`${r.axis}-${r.slug}`}>{r.title.en}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>{tr(t("Content type", "Loại nội dung"))}</label>
              <select value={blockType} onChange={(e) => setBlockType(e.target.value as BlockType)} className={field}>
                {CONTRIB_BLOCKS.map((b) => <option key={b.type} value={b.type}>{tr(b.label)}</option>)}
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={lbl}>{tr(t("Your name / org", "Tên / tổ chức"))}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Acme Co." />
              </div>
              <div>
                <label className={lbl}>{tr(t("You are a", "Bạn là"))}</label>
                <select value={ctype} onChange={(e) => setCtype(e.target.value as "user" | "partner" | "opc")} className={field}>
                  <option value="user">{tr(t("Customer / user", "Khách hàng / người dùng"))}</option>
                  <option value="partner">{tr(t("Partner", "Đối tác"))}</option>
                  <option value="opc">{tr(t("OPC", "OPC"))}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>{tr(t("Content", "Nội dung"))}</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className={field} placeholder={tr(t("Your case study, FAQ, or suggestion…", "Case study, FAQ hoặc đề xuất của bạn…"))} />
            </div>
            <div>
              <label className={lbl}>{tr(t("Why this helps (optional)", "Vì sao hữu ích (tùy chọn)"))}</label>
              <input value={rationale} onChange={(e) => setRationale(e.target.value)} className={field} />
            </div>
            <div className="flex justify-end">
              <button onClick={submit} disabled={!name.trim() || !content.trim()} className={buttonClass("primary", "lg")}>{tr(t("Submit for review", "Gửi để duyệt"))}<Icon name="send" size={16} /></button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
