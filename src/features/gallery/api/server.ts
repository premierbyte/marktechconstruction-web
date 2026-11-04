import { publicFetch } from "@/lib/seo";
import type { GalleryList } from "../types";
import type { GalleryFilters } from "../utils/pagination";

export const GALLERY_PER_PAGE = 12;

export async function getGallery(
  filters: GalleryFilters,
): Promise<GalleryList | null> {
  const params = new URLSearchParams({
    page: String(filters.page),
    per_page: String(GALLERY_PER_PAGE),
    sort: filters.sort,
  });

  if (filters.year) params.set("year", String(filters.year));
  if (filters.orientation) params.set("orientation", filters.orientation);
  if (filters.search) params.set("search", filters.search);

  return publicFetch<GalleryList>(`/public/gallery?${params.toString()}`, {
    revalidate: 60,
    tags: ["gallery", "public-content"],
  });
}