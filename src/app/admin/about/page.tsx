"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { useLang, t } from "@/lib/i18n";
import { aboutTabs } from "@/lib/about";
import { site } from "@/lib/site";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";

export default function AdminAbout() {
  const { tr } = useLang();
  return (
    <main className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin · about & site", "Quản trị · giới thiệu & site"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Company & site content", "Nội dung công ty & site"))}</h1>
      <div className="accent-rule my-5" />

      <div className="mb-6 border border-dashed border-border bg-surface p-4 text-[0.86rem] text-text-2">
        <span className="label mr-2 text-accent">{tr(t("Config-driven", "Theo cấu hình"))}</span>
        {tr(t(
          "About & site pages are currently defined in code (src/lib/about.ts, src/lib/site.ts). Inline editing of these will arrive with the Supabase CMS (admin.raiholdings.vn). For now this is a read-only overview.",
          "Các trang giới thiệu & site hiện được định nghĩa trong mã (src/lib/about.ts, src/lib/site.ts). Việc sửa trực tiếp sẽ có khi triển khai CMS Supabase (admin.raiholdings.vn). Hiện tại đây là trang xem tổng quan."
        ))}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-[1.05rem] font-medium text-text">{tr(t("Site configuration", "Cấu hình site"))}</h2>
        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {([
            [t("Name", "Tên"), site.name],
            [t("Product", "Sản phẩm"), site.product],
            [t("Tagline", "Khẩu hiệu"), site.tagline],
            [t("Contact email", "Email liên hệ"), site.contact.email],
            [t("Contact phone", "Điện thoại"), site.contact.phone],
            [t("URL", "URL"), site.url],
          ] as const).map(([label, value]) => (
            <div key={value} className="bg-surface p-4">
              <div className="label text-text-2">{tr(label)}</div>
              <div className="mt-0.5 text-[0.92rem] text-text">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[1.05rem] font-medium text-text">{tr(t("About pages", "Các trang giới thiệu"))}</h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-[0.86rem]">
            <thead><tr className="bg-surface text-text-2"><th className="p-3 font-medium">{tr(t("Page", "Trang"))}</th><th className="p-3 font-medium">{tr(t("Route", "Đường dẫn"))}</th><th className="p-3 font-medium">{tr(t("Actions", "Hành động"))}</th></tr></thead>
            <tbody>
              {aboutTabs.map((tab) => (
                <tr key={tab.key} className="border-t border-border">
                  <td className="p-3 text-text">{tr(tab.label)}</td>
                  <td className="p-3"><span className="mono text-[0.78rem] text-text-2">{tab.route}</span></td>
                  <td className="p-3"><Link href={tab.route} target="_blank" className={buttonClass("ghost", "sm")}><Icon name="arrow-up-right" size={13} />{tr(t("Preview", "Xem"))}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
