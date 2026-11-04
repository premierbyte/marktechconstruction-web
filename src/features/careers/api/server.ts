import { publicFetch } from "@/lib/seo";
import type { Vacancy } from "../types";

type VacancyListResponse = { data: Vacancy[] };
type VacancyResponse = { data: Vacancy | null };

export async function getVacancies(): Promise<Vacancy[]> {
  const response = await publicFetch<VacancyListResponse>("/public/vacancies", {
    revalidate: 60,
    tags: ["careers"],
  });

  return response?.data ?? [];
}

export async function getVacancy(slug: string): Promise<Vacancy | null> {
  const response = await publicFetch<VacancyResponse>(`/public/vacancies/${slug}`, {
    revalidate: 60,
    tags: ["careers", `vacancy:${slug}`],
  });

  return response?.data ?? null;
}