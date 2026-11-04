import { getCapabilities, type Capability } from "@/features/capabilities";
import { getPublicSettings, type SiteSettings } from "@/features/settings";
import { allowSlug, first, type SearchParamsRecord } from "../utils/params";

export type DiscussContent = {
  settings: SiteSettings | null;
  services: Capability[];
  sectors: Capability[];
  service?: string;
  sector?: string;
};

export async function getDiscussContent(
  searchParams: SearchParamsRecord,
): Promise<DiscussContent> {
  const [settings, services, sectors] = await Promise.all([
    getPublicSettings(),
    getCapabilities("service"),
    getCapabilities("sector"),
  ]);

  return {
    settings,
    services,
    sectors,
    service: allowSlug(first(searchParams.service), services),
    sector: allowSlug(first(searchParams.sector), sectors),
  };
}
