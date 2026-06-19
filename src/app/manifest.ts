import type { MetadataRoute } from "next";

// PWA manifest for RAI OS (docs/rai-app-hub-spec.md §3.1). Next generates this at
// /manifest.webmanifest (route takes precedence over any static file). Installing
// opens the RAI OS workspace; the marketing landing is just the entry point.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RAI OS",
    short_name: "RAI OS",
    description: "Hệ điều hành doanh nghiệp AI-Native — gõ một ý tưởng, RAI dựng nên công ty.",
    id: "/",
    start_url: "/workspace?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0a0b10",
    theme_color: "#0a0b10",
    lang: "vi",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Tạo Venture", short_name: "Venture", url: "/workspace/build" },
      { name: "Big Data", short_name: "Big Data", url: "/workspace/data" },
    ],
  };
}
