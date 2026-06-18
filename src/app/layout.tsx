import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import { site } from "@/lib/site";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — The Venture Operating System`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["RAI Holdings", "Venture Operating System", "VOS", "AI-native", "RAI FUND", "RAI LAB", "RAI ONE", "Business-In-A-Box"],
  openGraph: {
    title: `${site.name} — The Venture Operating System`,
    description: site.description,
    type: "website",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RAI Holdings", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f8f7f2",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
