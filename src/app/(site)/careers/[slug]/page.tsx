import type { Metadata } from "next";
import { CareerDetail, getVacancy } from "@/features/careers";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getVacancy(slug);

  if (!vacancy) {
    return buildMetadata({
      title: "Vacancy not found",
      path: `/careers/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: vacancy.seo?.title || vacancy.title,
    description: vacancy.seo?.description || vacancy.summary,
    path: `/careers/${slug}`,
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  return <CareerDetail slug={slug} />;
}