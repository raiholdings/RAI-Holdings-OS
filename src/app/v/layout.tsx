import { VentureHeader } from "@/components/ventures/VentureHeader";
import { VentureFooter } from "@/components/ventures/VentureFooter";

export default function VentureLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <VentureHeader />
      <main className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-8 sm:px-8">{children}</main>
      <VentureFooter />
    </div>
  );
}
