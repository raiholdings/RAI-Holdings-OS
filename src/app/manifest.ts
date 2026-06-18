import type { MetadataRoute } from "next";

// PWA manifest — makes raiholdings.vn installable (and TWA-packageable for Play Store).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RAI Holdings",
    short_name: "RAI Holdings",
    description: "Hệ điều hành khởi nghiệp cho nền kinh tế AI-native — một hệ sinh thái nền tảng, chương trình và công ty.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f7f2",
    theme_color: "#378add",
    lang: "vi",
    dir: "ltr",
    categories: ["business", "productivity", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
