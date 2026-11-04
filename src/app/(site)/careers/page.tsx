import type { Metadata } from "next";
import { CareersPage } from "@/features/careers";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description:
    "Current opportunities to join the team, with role details, locations and closing dates.",
  path: "/careers",
});

export default function Page() {
  return <CareersPage />;
}