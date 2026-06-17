"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, t } from "@/lib/i18n";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { leafCategories, pricingLabels, deploymentLabels, type Deployment, type PricingModel } from "@/lib/platform";
import { hydrateStore, submitPlatform } from "@/lib/platform-store";

const WRAP = "mx-auto max-w-[760px] px-5 sm:px-8";

export function AddPlatform() {
  const { tr } = useLang();
  useEffect(() => { hydrateStore(); }, []);
  const cats = leafCategories();
  const [name, setName] = useState("");
  const [vendorName, setVendor] = useState("");
  const [websiteUrl, setWebsite] = useState("");
  const [shortDescription, setDesc] = useState("");
  const [categorySlug, setCat] = useState(cats[0]?.slug ?? "");
  const [pricingModel, setPricing] = useState<PricingModel>("freemium");
  const [deployment, setDeployment] = useState<Deployment>("cloud");
  const [done, setDone] = useState(false);

  function submit() {
    if (!name.trim() || !websiteUrl.trim()) return;
    submitPlatform({ name: name.trim(), vendorName: vendorName.trim() || name.trim(), websiteUrl: websiteUrl.trim(), shortDescription: shortDescription.trim(), categorySlug, pricingModel, deployment });
    setDone(true);
  }
  const field = "w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 text-[0.92rem] text-text outline-none focus:border-border-strong";
  const lbl = "label mb-1.5 block text-text-2";

  return (
    <main className="bg-bg">
      <section className="border-b border-border bg-surface">
        <div className={`${WRAP} py-12`}>
          <div className="label mb-4 text-accent">{tr(t("Community", "Cộng đồng"))}</div>
          <div className="accent-rule mb-6" />
          <h1 className="text-[2rem] font-medium tracking-tight text-text">{tr(t("Add a platform", "Thêm nền tảng"))}</h1>
          <p className="mt-3 text-[1rem] text-text-2">{tr(t("Submit a platform for the catalog. It enters the review queue — a human approves before it's published. Only factual info, please.", "Gửi một nền tảng cho catalog. Nó vào hàng đợi duyệt — người duyệt xác nhận trước khi công khai. Chỉ thông tin factual."))}</p>
        </div>
      </section>
      <section className={`${WRAP} py-12`}>
        {done ? (
          <div className="border border-ok/40 bg-surface p-8 text-center">
            <Icon name="check" size={28} className="mx-auto text-ok" />
            <h2 className="mt-3 text-[1.2rem] font-medium text-text">{tr(t("Submitted for review", "Đã gửi để duyệt"))}</h2>
            <p className="mt-2 text-[0.94rem] text-text-2">{tr(t("Reviewers see it in the platform admin console.", "Người duyệt thấy nó trong bảng quản trị."))}</p>
            <div className="mt-6 flex justify-center gap-3"><button onClick={() => { setDone(false); setName(""); setWebsite(""); setDesc(""); }} className={buttonClass("outline")}>{tr(t("Submit another", "Gửi tiếp"))}</button><Link href="/admin/platform" className={buttonClass("primary")}>{tr(t("Open review queue", "Mở hàng đợi"))}</Link></div>
          </div>
        ) : (
          <div className="grid gap-5 border border-border bg-surface p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className={lbl}>{tr(t("Platform name", "Tên nền tảng"))}</label><input value={name} onChange={(e) => setName(e.target.value)} className={field} /></div>
              <div><label className={lbl}>{tr(t("Vendor", "Nhà cung cấp"))}</label><input value={vendorName} onChange={(e) => setVendor(e.target.value)} className={field} /></div>
            </div>
            <div><label className={lbl}>{tr(t("Website", "Website"))}</label><input value={websiteUrl} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={field} /></div>
            <div><label className={lbl}>{tr(t("Short description", "Mô tả ngắn"))}</label><textarea value={shortDescription} onChange={(e) => setDesc(e.target.value)} rows={3} className={field} /></div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div><label className={lbl}>{tr(t("Category", "Danh mục"))}</label><select value={categorySlug} onChange={(e) => setCat(e.target.value)} className={field}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name.en}</option>)}</select></div>
              <div><label className={lbl}>{tr(t("Pricing", "Mô hình giá"))}</label><select value={pricingModel} onChange={(e) => setPricing(e.target.value as PricingModel)} className={field}>{(["free", "freemium", "paid", "contact"] as PricingModel[]).map((m) => <option key={m} value={m}>{tr(pricingLabels[m])}</option>)}</select></div>
              <div><label className={lbl}>{tr(t("Deployment", "Triển khai"))}</label><select value={deployment} onChange={(e) => setDeployment(e.target.value as Deployment)} className={field}>{(["cloud", "on_prem", "hybrid"] as Deployment[]).map((m) => <option key={m} value={m}>{tr(deploymentLabels[m])}</option>)}</select></div>
            </div>
            <div className="flex justify-end"><button onClick={submit} disabled={!name.trim() || !websiteUrl.trim()} className={buttonClass("primary", "lg")}>{tr(t("Submit for review", "Gửi để duyệt"))}<Icon name="send" size={16} /></button></div>
          </div>
        )}
      </section>
    </main>
  );
}
