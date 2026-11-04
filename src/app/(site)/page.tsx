import type { Metadata } from "next";
import { HomePage } from "@/features/home";
import { getPublicSettings } from "@/features/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return buildMetadata({
    title: settings?.company?.name || "Building contractor",
    description:
      settings?.company?.description ||
      "Construction services, project case studies and project enquiries.",
    path: "/",
  });
}

export default function Page() {
  return <HomePage />;
}
