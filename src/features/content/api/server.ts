import { publicFetch } from "@/lib/seo";
import type { ContentPage, Faq } from "../types";

type PageResponse = { data: ContentPage | null };
type PageListResponse = { data: ContentPage[] };
type FaqListResponse = { data: Faq[] };

export async function getContentPages(): Promise<ContentPage[]> {
  const response = await publicFetch<PageListResponse>("/public/pages", {
    revalidate: 60,
    tags: ["content", "pages"],
  });

  return response?.data ?? [];
}

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  const response = await publicFetch<PageResponse>(`/public/pages/${slug}`, {
    revalidate: 60,
    tags: ["content", `page:${slug}`],
  });

  return response?.data ?? null;
}

export async function getFaqs(): Promise<Faq[]> {
  const response = await publicFetch<FaqListResponse>("/public/faqs", {
    revalidate: 60,
    tags: ["content", "faqs"],
  });

  return response?.data ?? [];
}
