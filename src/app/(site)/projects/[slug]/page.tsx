import type { Metadata } from "next";
import { getProject } from "@/features/projects";
import { ProjectDetailPage } from "@/features/project-detail";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return buildMetadata({
      title: "Project not found",
      path: `/projects/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: project.seo?.title || project.title,
    description: project.seo?.description || project.summary,
    path: `/projects/${slug}`,
    image: project.cover?.url
      ? { url: project.cover.url, alt: project.cover.alt ?? project.title }
      : null,
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  return <ProjectDetailPage slug={slug} />;
}
