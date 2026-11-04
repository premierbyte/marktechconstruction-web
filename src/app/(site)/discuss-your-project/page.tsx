import type { Metadata } from "next";
import { DiscussProjectPage } from "@/features/discuss-project";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Discuss your project",
  description:
    "Share a construction project brief: location, building type, service, priorities and preferred start.",
  path: "/discuss-your-project",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return <DiscussProjectPage searchParams={params} />;
}
