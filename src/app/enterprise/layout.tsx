import type { Metadata } from "next";
import { EnterpriseHeader } from "@/components/enterprise/EnterpriseHeader";

export const metadata: Metadata = {
  title: "Enterprise",
  description: "RAI OS for Enterprise — solutions by company size, use case, and industry.",
};

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <EnterpriseHeader />
      {children}
    </div>
  );
}
