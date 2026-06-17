import { Suspense } from "react";
import { CompareView } from "@/components/platform/CompareView";

export default function Compare() {
  return (
    <Suspense fallback={null}>
      <CompareView />
    </Suspense>
  );
}
