import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
import type { ProjectFilters, ProjectMeta } from "@/features/projects";

const FIELD_CLASS =
  "min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink";

export function ProjectsFilterForm({
  filters,
  meta,
  hasFilters,
}: {
  filters: ProjectFilters;
  meta?: ProjectMeta;
  hasFilters: boolean;
}) {
  return (
    <form
      method="get"
      className="rounded-2xl border border-line bg-white p-5 sm:p-6"
      aria-label="Filter projects"
    >
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink">
        <Filter aria-hidden className="size-4 text-clay" />
        Filter projects
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label
            htmlFor="filter-status"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={filters.status ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="filter-sector"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Sector
          </label>
          <select
            id="filter-sector"
            name="sector"
            defaultValue={filters.sector ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">All sectors</option>
            {(meta?.filters.sectors ?? []).map((sector) => (
              <option key={sector.slug} value={sector.slug}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filter-service"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Service
          </label>
          <select
            id="filter-service"
            name="service"
            defaultValue={filters.service ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">All services</option>
            {(meta?.filters.services ?? []).map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filter-location"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Location
          </label>
          <input
            id="filter-location"
            name="location"
            defaultValue={filters.location ?? ""}
            maxLength={120}
            placeholder="City or region"
            className={FIELD_CLASS}
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-soft"
          >
            Apply filters
          </button>
          {hasFilters ? (
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-forest hover:bg-mist"
            >
              <RotateCcw aria-hidden className="size-4" />
              Reset
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}
