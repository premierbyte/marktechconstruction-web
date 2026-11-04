import { getPublicSettings, type SiteSettings } from "@/features/settings";

export async function getContactContent(): Promise<SiteSettings | null> {
  return getPublicSettings();
}
