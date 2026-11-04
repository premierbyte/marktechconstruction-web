import type { Metadata } from "next";
import { getContentPage } from "@/features/content";
import { buildMetadata } from "@/lib/seo";

export async function getPolicyMetadata(slug: string): Promise<Metadata> {
  const page = await getContentPage(slug);

  if (!page) {
    return buildMetadata({
      title: "Policy not found",
      path: `/policies/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.summary,
    path: `/policies/${slug}`,
    image: page.media?.url
      ? { url: page.media.url, alt: page.media.alt ?? page.title }
      : null,
  });
}
