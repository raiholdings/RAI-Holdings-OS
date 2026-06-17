import { t, type T } from "@/lib/i18n-core";

export type DashNavItem = { label: T; href: string; icon: string; desc: T };

export const dashNav: DashNavItem[] = [
  { label: t("Overview", "Tổng quan"), href: "/app", icon: "layout", desc: t("System status", "Trạng thái hệ thống") },
];
