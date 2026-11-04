import type { ProjectFilters } from "@/features/projects";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const STATUSES = ["completed", "ongoing"] as const;

export function first(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseProjectFilters(params: SearchParamsRecord): ProjectFilters {
  const status = first(params.status);
  const sector = first(params.sector);
  const service = first(params.service);
  const location = first(params.location);
  const page = Number.parseInt(first(params.page) ?? "1", 10);

  return {
    status:
      status && STATUSES.includes(status as (typeof STATUSES)[number])
        ? status
        : undefined,
    sector:
      sector && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sector) ? sector : undefined,
    service:
      service && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(service)
        ? service
        : undefined,
    location: location ? location.slice(0, 120) : undefined,
    page: Number.isFinite(page) && page > 0 && page <= 1000 ? page : 1,
    per_page: 9,
  };
}

export function projectFiltersHref(
  filters: ProjectFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  Object.entries({ ...filters, page, per_page: undefined }).forEach(
    ([key, value]) => {
      if (value !== undefined && `${value}`.length > 0)
        params.set(key, `${value}`);
    },
  );

  const query = params.toString();
  return `/projects${query ? `?${query}` : ""}`;
}
