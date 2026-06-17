import type { Metadata } from "next";
import { PlatformHeader } from "@/components/platform/PlatformHeader";

export const metadata: Metadata = { title: "Platform admin", description: "RAI Platform admin — submissions, AI ingestion queue, sources." };

export default function AdminPlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PlatformHeader />
      {children}
    </div>
  );
}
