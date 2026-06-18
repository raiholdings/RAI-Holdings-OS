"use client";

import { useParams } from "next/navigation";
import { VentureDetail } from "@/components/workspace/VentureDetail";

export default function VentureDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <VentureDetail id={id} />;
}
