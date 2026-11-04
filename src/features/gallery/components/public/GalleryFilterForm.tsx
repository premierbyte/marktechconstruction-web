import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";
import type { GalleryFilters } from "../../utils/pagination";

const FIELD_CLASS =
  "min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink";

export function GalleryFilterForm({
  filters,
  years,
  hasFilters,
}: {
  filters: GalleryFilters;
  years: number[];
  hasFilters: boolean;
}) {
  return (
    <form
      method="get"
      action="/gallery"
      className="rounded-2xl border border-line bg-white p-5 sm:p-6"
      aria-label="Filter gallery"
    >
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-ink">
        <Filter aria-hidden className="size-4 text-clay" />
        Filter gallery
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label
            htmlFor="gallery-search"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Search
          </label>
          <input
            id="gallery-search"
            name="search"
            defaultValue={filters.search ?? ""}
            maxLength={120}
            placeholder="Caption or description"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label
            htmlFor="gallery-year"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Year
          </label>
          <select
            id="gallery-year"
            name="year"
            defaultValue={filters.year ? String(filters.year) : ""}
            className={FIELD_CLASS}
          >
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="gallery-orientation"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Orientation
          </label>
          <select
            id="gallery-orientation"
            name="orientation"
            defaultValue={filters.orientation ?? ""}
            className={FIELD_CLASS}
          >
            <option value="">Any orientation</option>
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
            <option value="square">Square</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="gallery-sort"
            className="mb-1.5 block text-xs font-semibold text-ink"
          >
            Sort by
          </label>
          <select
            id="gallery-sort"
            name="sort"
            defaultValue={filters.sort}
            className={FIELD_CLASS}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title (A–Z)</option>
          </select>
        </div>

        <div className="flex items-end gap-2 md:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-soft"
          >
            Apply filters
          </button>
          {hasFilters ? (
            <Link
              href="/gallery"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line px-4 text-sm font-semibold text-forest hover:bg-mist"
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