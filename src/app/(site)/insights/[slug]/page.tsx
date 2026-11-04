import type { Metadata } from "next";
import { InsightDetail, getInsight } from "@/features/insights";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsight(slug);

  if (!insight) {
    return buildMetadata({
      title: "Insight not found",
      path: `/insights/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: insight.seo?.title || insight.title,
    description: insight.seo?.description || insight.summary,
    path: `/insights/${slug}`,
    type: "article",
    publishedTime: insight.published_on ?? null,
    modifiedTime: insight.published_on ?? null,
    authors: insight.author_name ? [insight.author_name] : undefined,
    image: insight.media?.url
      ? { url: insight.media.url, alt: insight.media.alt ?? insight.title }
      : null,
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  return <InsightDetail slug={slug} />;
}