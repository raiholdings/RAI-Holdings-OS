"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useLang, t, type T } from "@/lib/i18n";

const WRAP = "mx-auto max-w-[1100px] px-5 sm:px-8";

type Card = { href: string; icon: string; title: T; desc: T; ready: boolean };

const cards: Card[] = [
  { href: "/admin/platform", icon: "grid", title: t("Platform", "Nền tảng"), desc: t("Catalog, submissions & AI ingestion.", "Danh mục, đề xuất & nạp AI."), ready: true },
  { href: "/admin/portfolio", icon: "stack", title: t("Portfolio", "Danh mục đầu tư"), desc: t("Entries, profiles, review queue, versions.", "Mục, hồ sơ, hàng đợi duyệt, phiên bản."), ready: true },
  { href: "/admin/pricing", icon: "receipt", title: t("Pricing", "Bảng giá"), desc: t("Plans, comparison table, hero & banner.", "Gói, bảng so sánh, hero & banner."), ready: true },
  { href: "/admin/enterprise", icon: "building", title: t("Enterprise", "Doanh nghiệp"), desc: t("Vertical pages, blocks & contributors.", "Trang ngành, khối & đóng góp."), ready: true },
  { href: "/admin/marketplace", icon: "cart", title: t("Marketplace", "Chợ ứng dụng"), desc: t("Listings, pricing tiers & review.", "Listing, gói giá & duyệt."), ready: true },
  { href: "/admin/mcp", icon: "server", title: t("MCP servers", "Máy chủ MCP"), desc: t("Publish, sync & moderate servers.", "Đăng, đồng bộ & kiểm duyệt máy chủ."), ready: true },
  { href: "/admin/apps", icon: "box", title: t("Apps", "Ứng dụng"), desc: t("App submissions & review.", "Đề xuất ứng dụng & duyệt."), ready: true },
  { href: "/admin/code", icon: "cpu", title: t("Code", "Mã nguồn"), desc: t("Repositories, imports & licenses.", "Kho mã, nhập & giấy phép."), ready: true },
  { href: "/admin/llms", icon: "server", title: t("LLM gateway", "Cổng LLM"), desc: t("Markups, provider keys & revenue stats.", "Markup, khóa NCC & thống kê doanh thu."), ready: true },
  { href: "/admin/about", icon: "world", title: t("About & site", "Giới thiệu & site"), desc: t("Company info & static pages.", "Thông tin công ty & trang tĩnh."), ready: true },
];

export default function AdminHome() {
  const { tr } = useLang();
  return (
    <div className={`${WRAP} py-10`}>
      <div className="label mb-2 text-accent">{tr(t("Admin", "Quản trị"))}</div>
      <h1 className="text-[1.7rem] font-medium tracking-tight text-text">{tr(t("Content management", "Quản trị nội dung"))}</h1>
      <p className="mt-2 max-w-[640px] text-[0.95rem] text-text-2">
        {tr(t(
          "All content for RAI Holdings OS is edited here. Public pages are read-only.",
          "Mọi nội dung của RAI Holdings OS được sửa tại đây. Trang public chỉ để xem."
        ))}
      </p>
      <div className="accent-rule my-6" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group flex flex-col border border-border bg-surface p-5 transition-colors hover:border-border-strong">
            <div className="mb-3 flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-[var(--radius-md)] bg-accent/10 text-accent">
                <Icon name={c.icon} size={18} />
              </span>
              <Icon name="arrow-up-right" size={16} className="text-text-2 transition-colors group-hover:text-text" />
            </div>
            <div className="text-[1.02rem] font-medium text-text">{tr(c.title)}</div>
            <div className="mt-1 text-[0.86rem] text-text-2">{tr(c.desc)}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 border border-dashed border-border bg-surface p-4 text-[0.84rem] text-text-2">
        <span className="label mr-2 text-accent">{tr(t("Note", "Lưu ý"))}</span>
        {tr(t(
          "Temporary password gate. Content lives in the app's local store; it will migrate to Supabase (admin.raiholdings.vn) once instance #1 is live.",
          "Cổng mật khẩu tạm thời. Nội dung đang lưu trong store của app; sẽ chuyển sang Supabase (admin.raiholdings.vn) khi có instance #1."
        ))}
      </div>
    </div>
  );
}
