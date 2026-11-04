import type { Metadata } from "next";
import { TeamPage } from "@/features/team";
import { getTeamPage } from "@/features/team";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getTeamPage();

  return buildMetadata({
    title: page?.seo?.title || page?.title || "Our Team",
    description:
      page?.seo?.description ||
      page?.summary ||
      "Meet the management and project team behind Marktech Construction Nigeria Limited.",
    path: "/team",
  });
}

export default function Page() {
  return <TeamPage />;
}
