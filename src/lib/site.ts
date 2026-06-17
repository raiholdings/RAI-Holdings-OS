/**
 * Global site configuration for RAI Holdings OS.
 */
import { t, type T } from "@/lib/i18n-core";

export const site = {
  name: "RAI Holdings",
  product: "RAI Holdings OS",
  tagline: "The Venture Operating System",
  description:
    "RAI Holdings is the Venture Operating System for the AI-native economy — the orchestration layer over capital, technology, and commerce. One master brand, four operating entities, six infrastructure layers, 29 products.",
  url: "https://rai.holdings",
  docId: "RAI-OS // v1.0.0",
  contact: {
    email: "thu@phamvanthu.com",
    phone: "0967 806 686",
    phoneHref: "tel:0967806686",
  },
} as const;

export type NavLink = { label: T; href: string };

export const navLinks: NavLink[] = [
  { label: t("Entities", "Pháp nhân"), href: "#entities" },
  { label: t("Layers", "Lớp"), href: "#layers" },
  { label: t("Verticals", "Ngành"), href: "#verticals" },
  { label: t("Thesis", "Luận điểm"), href: "#thesis" },
];
