import type { Metadata } from "next";
import { SectorsPage } from "@/features/sectors";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sectors",
  description: "Sector experience and relevant construction capabilities.",
  path: "/sectors",
});

export default function Page() {
  return <SectorsPage />;
}
