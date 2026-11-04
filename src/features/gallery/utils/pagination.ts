export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const GALLERY_SORTS = ["newest", "oldest", "title"] as const;

export const GALLERY_ORIENTATIONS = [
  "landscape",
  "portrait",
  "square",
] as const;

export type GallerySort = (typeof GALLERY_SORTS)[number];
export type GalleryOrientation = (typeof GALLERY_ORIENTATIONS)[number];

export type GalleryFilters = {
  page: number;
  sort: GallerySort;
  year?: number;
  orientation?: GalleryOrientation;
  search?: string;
};

export function first(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseGalleryFilters(
  params: SearchParamsRecord,
): GalleryFilters {
  const page = Number.parseInt(first(params.page) ?? "1", 10);
  const sort = first(params.sort);
  const year = Number.parseInt(first(params.year) ?? "", 10);
  const orientation = first(params.orientation);
  const search = first(params.search)?.trim();

  return {
    page: Number.isFinite(page) && page > 0 && page <= 1000 ? page : 1,
    sort: GALLERY_SORTS.includes(sort as GallerySort)
      ? (sort as GallerySort)
      : "newest",
    year: Number.isFinite(year) && year >= 2000 && year <= 2100 ? year : undefined,
    orientation: GALLERY_ORIENTATIONS.includes(
      orientation as GalleryOrientation,
    )
      ? (orientation as GalleryOrientation)
      : undefined,
    search: search ? search.slice(0, 120) : undefined,
  };
}

export function galleryHref(filters: GalleryFilters): string {
  const params = new URLSearchParams();

  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.year) params.set("year", String(filters.year));
  if (filters.orientation) params.set("orientation", filters.orientation);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();

  return `/gallery${query ? `?${query}` : ""}`;
}

export function hasGalleryFilters(filters: GalleryFilters): boolean {
  return Boolean(
    filters.year ||
      filters.orientation ||
      filters.search ||
      filters.sort !== "newest",
  );
}