import type { Metadata } from "next";
import { AboutPage } from "@/features/about";
import { getPublicSettings } from "@/features/settings";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return buildMetadata({
    title: "About",
    description:
      settings?.company?.description ||
      "Company overview, values and the approach to construction delivery.",
    path: "/about",
  });
}

export default function Page() {
  return <AboutPage />;
}
