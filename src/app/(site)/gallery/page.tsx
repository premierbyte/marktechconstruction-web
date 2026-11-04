import type { Metadata } from "next";
import { GalleryPage } from "@/features/gallery";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description:
    "Photographs from completed and ongoing construction projects, published by the team.",
  path: "/gallery",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return <GalleryPage searchParams={params} />;
}
