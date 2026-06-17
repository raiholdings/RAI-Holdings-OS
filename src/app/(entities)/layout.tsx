import { EcosystemHeader } from "@/components/layout/EcosystemHeader";

export default function EntitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <EcosystemHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
