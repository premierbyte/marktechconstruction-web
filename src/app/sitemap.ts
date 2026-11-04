import type { MetadataRoute } from "next";
import { getCapabilities } from "@/features/capabilities";
import { getVacancies } from "@/features/careers";
import { getContentPages } from "@/features/content";
import { getInsights } from "@/features/insights";
import { getProjects } from "@/features/projects";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "/about",
  "/team",
  "/services",
  "/sectors",
  "/projects",
  "/insights",
  "/careers",
  "/gallery",
  "/faqs",
  "/contact",
  "/discuss-your-project",
];

async function allProjects() {
  const first = await getProjects({ page: 1, per_page: 24 });
  const projects = [...(first?.data ?? [])];
  const lastPage = Math.min(first?.meta.last_page ?? 1, 50);

  for (let page = 2; page <= lastPage; page += 1) {
    const next = await getProjects({ page, per_page: 24 });
    projects.push(...(next?.data ?? []));
  }

  return projects;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, sectors, pages, projects, insights, vacancies] = await Promise.all([
    getCapabilities("service"),
    getCapabilities("sector"),
    getContentPages(),
    allProjects(),
    getInsights(),
    getVacancies(),
  ]);

  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "" || path === "/projects" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/projects" ? 0.9 : 0.7,
  }));

  services.forEach((service) => {
    entries.push({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });

  sectors.forEach((sector) => {
    entries.push({
      url: absoluteUrl(`/sectors/${sector.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  insights.forEach((insight) => {
    entries.push({
      url: absoluteUrl(`/insights/${insight.slug}`),
      lastModified: insight.published_on ? new Date(insight.published_on) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  });

  pages.forEach((page) => {
    if (page.category !== "Policies") {
      return;
    }

    entries.push({
      url: absoluteUrl(`/policies/${page.slug}`),
      lastModified: page.updated_on ? new Date(page.updated_on) : now,
      changeFrequency: "yearly",
      priority: 0.3,
    });
  });

  projects.forEach((project) => {
    const lastModified = project.completed_on || project.started_on;

    entries.push({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: lastModified ? new Date(lastModified) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });

  vacancies.forEach((vacancy) => {
    const lastModified = vacancy.date_posted || vacancy.closing_on;

    entries.push({
      url: absoluteUrl(`/careers/${vacancy.slug}`),
      lastModified: lastModified ? new Date(lastModified) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  });

  return entries;
}
