"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BuildRunner } from "@/components/workspace/BuildRunner";

const WRAP = "mx-auto max-w-[1180px] px-5 sm:px-8";

function BuildPageInner() {
  const idea = useSearchParams().get("idea");
  return <BuildRunner idea={idea} />;
}

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <main className={`${WRAP} py-8`}>
          <div className="h-1.5 w-40 animate-pulse rounded-full bg-surface" />
        </main>
      }
    >
      <BuildPageInner />
    </Suspense>
  );
}
