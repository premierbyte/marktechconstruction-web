import { publicFetch } from "@/lib/seo";
import type { Project, ProjectFilters, ProjectList } from "../types";

type DetailResponse = { data: Project };

export async function getProjects(filters: ProjectFilters = {}): Promise<ProjectList | null> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.length > 0) {
      params.set(key, `${value}`);
    }
  });

  const query = params.toString();

  return publicFetch<ProjectList>(`/public/projects${query ? `?${query}` : ""}`, {
    revalidate: 60,
    tags: ["projects"],
  });
}

export async function getProject(slug: string): Promise<Project | null> {
  const response = await publicFetch<DetailResponse>(`/public/projects/${slug}`, {
    revalidate: 60,
    tags: ["projects", `project:${slug}`],
  });

  return response?.data ?? null;
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const list = await getProjects({ page: 1 });
  const projects = list?.data ?? [];
  const featured = projects.filter((project) => project.featured);

  return (featured.length > 0 ? featured : projects).slice(0, limit);
}
