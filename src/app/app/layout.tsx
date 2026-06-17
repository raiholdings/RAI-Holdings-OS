import type { Metadata } from "next";
import { Sidebar } from "@/components/dash/Sidebar";

export const metadata: Metadata = {
  title: "OS Console",
  description: "RAI Holdings OS — operating console.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
