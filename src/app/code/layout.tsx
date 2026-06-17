import type { Metadata } from "next";
import { CodeHeader } from "@/components/code/CodeHeader";

export const metadata: Metadata = {
  title: "Code",
  description: "RAI Code — create, reuse, and instantly deploy source code with SPDX licensing.",
};

export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <CodeHeader />
      {children}
    </div>
  );
}
