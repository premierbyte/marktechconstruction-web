import type { Metadata } from "next";
import { getCapability } from "@/features/capabilities";
import { ServiceDetailPage } from "@/features/service-detail";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = await getCapability("service", slug);

  if (!service) {
    return buildMetadata({
      title: "Service not found",
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: service.seo?.title || service.name,
    description: service.seo?.description || service.summary,
    path: `/services/${slug}`,
    image: service.media?.url
      ? { url: service.media.url, alt: service.media.alt ?? service.name }
      : null,
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  return <ServiceDetailPage slug={slug} />;
}
