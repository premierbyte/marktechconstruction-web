import type { Metadata } from "next";
import { ServicesPage } from "@/features/services";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Construction services, what they include and how to request a project-specific proposal.",
  path: "/services",
});

export default function Page() {
  return <ServicesPage />;
}
