import type { Metadata } from "next";
import { InsightsPage } from "@/features/insights";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Insights",
  description:
    "Practical notes on planning, building and maintaining construction projects in Nigeria.",
  path: "/insights",
});

export default function Page() {
  return <InsightsPage />;
}