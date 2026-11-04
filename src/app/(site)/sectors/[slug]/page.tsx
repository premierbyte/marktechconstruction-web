import type { Metadata } from "next";
import { getCapability } from "@/features/capabilities";
import { SectorDetailPage } from "@/features/sector-detail";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getCapability("sector", slug);

  if (!sector) {
    return buildMetadata({
      title: "Sector not found",
      path: `/sectors/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: sector.seo?.title || sector.name,
    description: sector.seo?.description || sector.summary,
    path: `/sectors/${slug}`,
    image: sector.media?.url
      ? { url: sector.media.url, alt: sector.media.alt ?? sector.name }
      : null,
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  return <SectorDetailPage slug={slug} />;
}
