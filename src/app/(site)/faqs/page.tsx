import type { Metadata } from "next";
import { FaqsPage } from "@/features/faqs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQs",
  description:
    "Practical answers about enquiries, projects and how the site handles your information.",
  path: "/faqs",
});

export default function Page() {
  return <FaqsPage />;
}
