import { publicFetch } from "@/lib/seo";
import type { Insight } from "../types";

type InsightListResponse = { data: Insight[] };
type InsightResponse = { data: Insight | null };

export async function getInsights(): Promise<Insight[]> {
  const response = await publicFetch<InsightListResponse>("/public/insights", {
    revalidate: 60,
    tags: ["insights"],
  });

  return response?.data ?? [];
}

export async function getInsight(slug: string): Promise<Insight | null> {
  const response = await publicFetch<InsightResponse>(`/public/insights/${slug}`, {
    revalidate: 60,
    tags: ["insights", `insight:${slug}`],
  });

  return response?.data ?? null;
}