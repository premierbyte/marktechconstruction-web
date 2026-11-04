import { publicFetch } from "@/lib/seo";
import type { SiteSettings } from "../types";

type SettingsResponse = { data: SiteSettings | null };

export async function getPublicSettings(): Promise<SiteSettings | null> {
  const response = await publicFetch<SettingsResponse>("/public/settings", {
    revalidate: 60,
    tags: ["settings"],
  });

  return response?.data ?? null;
}
