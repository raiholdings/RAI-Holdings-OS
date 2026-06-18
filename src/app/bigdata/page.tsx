import type { Metadata } from "next";
import { BigDataView } from "@/components/bigdata/BigDataView";

export const metadata: Metadata = {
  title: "Big Data",
  description: "RAI Big Data — company & market intelligence, synced from raicrm.vn.",
};

export default function BigDataPage() {
  return <BigDataView />;
}
