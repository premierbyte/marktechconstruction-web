import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { getGallery } from "../../api/server";
import {
  hasGalleryFilters,
  type GalleryFilters,
} from "../../utils/pagination";
import { GalleryFilterForm } from "./GalleryFilterForm";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryPagination } from "./GalleryPagination";

export async function GalleryResults({
  filters,
}: {
  filters: GalleryFilters;
}) {
  const result = await getGallery(filters);

  if (result === null) {
    return (
      <div className="rounded-2xl border border-clay/30 bg-clay/5 p-8 text-center">
        <h2 className="display text-2xl text-ink">
          The gallery could not be loaded
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          This is a temporary failure, not an empty gallery. Try again in a
          moment or contact the team directly.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/gallery">Try again</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact
          </ButtonLink>
        </div>
      </div>
    );
  }

  const { data, meta, filters: options } = result;
  const filtered = hasGalleryFilters(filters);

  return (
    <>
      <GalleryFilterForm
        filters={filters}
        years={options?.years ?? []}
        hasFilters={filtered}
      />

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          {meta.total} {meta.total === 1 ? "photograph" : "photographs"}
          {meta.last_page > 1 ? (
            <span className="text-xs">
              {" "}
              · page {meta.current_page} of {meta.last_page}
            </span>
          ) : null}
        </p>
      </div>

      <div className="mt-6">
        {data.length === 0 ? (
          <EmptyState
            title={
              filtered
                ? "No photographs match these filters"
                : filters.page > 1
                  ? "No photographs on this page"
                  : "No photographs are published yet"
            }
            description={
              filtered
                ? "Try removing a filter or resetting the selection."
                : filters.page > 1
                  ? "This page has no images. Return to the first page of the gallery."
                  : "Published project photography will appear here. You can still explore projects and discuss your own."
            }
            action={
              filtered || filters.page > 1 ? (
                <ButtonLink href="/gallery" variant="secondary">
                  {filtered ? "Reset filters" : "Back to page 1"}
                </ButtonLink>
              ) : (
                <ButtonLink href="/projects">Browse projects</ButtonLink>
              )
            }
          />
        ) : (
          <GalleryGrid images={data} />
        )}
      </div>

      <GalleryPagination meta={meta} filters={filters} />
    </>
  );
}