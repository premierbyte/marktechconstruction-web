import type { Metadata } from "next";
import { ContactPage } from "@/features/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Contact details, business hours and a general enquiry form.",
  path: "/contact",
});

export default function Page() {
  return <ContactPage />;
}
