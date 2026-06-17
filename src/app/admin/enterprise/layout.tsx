import type { Metadata } from "next";
import { EnterpriseHeader } from "@/components/enterprise/EnterpriseHeader";

export const metadata: Metadata = { title: "Enterprise admin", description: "RAI Enterprise content admin — pages, review queue, metrics, versions." };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <EnterpriseHeader />
      {children}
    </div>
  );
}
