import type { Metadata } from "next";
import { LLMsView } from "@/components/llms/LLMsView";

export const metadata: Metadata = {
  title: "RAI LLMs",
  description: "RAI LLMs — unified LLM gateway (OpenAI-compatible) with smart routing, fallback and transparent VND-credit billing.",
};

export default function LLMsPage() {
  return <LLMsView />;
}
