import type { Metadata } from "next";
import { ProjectsPage } from "@/features/projects-list";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Approved construction project case studies, filtered by sector, service, location and status.",
  path: "/projects",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return <ProjectsPage searchParams={params} />;
}
