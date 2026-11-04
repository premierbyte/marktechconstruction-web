import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ProjectFilters, ProjectMeta } from "@/features/projects";
import { projectFiltersHref } from "../../utils/filters";

type PageItem = number | "ellipsis";

function pageItems(current: number, last: number): PageItem[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1);
  }

  const anchors = new Set<number>([1, last, current, current - 1, current + 1]);
  const pages = [...anchors]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;

  for (const page of pages) {
    if (previous !== 0 && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
    previous = page;
  }

  return items;
}

export function ProjectsPagination({
  filters,
  meta,
}: {
  filters: ProjectFilters;
  meta?: ProjectMeta;
}) {
  if (!meta || meta.last_page <= 1) {
    return null;
  }

  const items = pageItems(meta.current_page, meta.last_page);
  const disabled =
    "inline-flex min-h-9 cursor-not-allowed items-center justify-center rounded-full border border-line px-4 text-sm font-semibold text-muted/60";

  return (
    <nav
      aria-label="Project pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {meta.current_page > 1 ? (
        <ButtonLink
          href={projectFiltersHref(filters, meta.current_page - 1)}
          variant="secondary"
          size="sm"
          rel="prev"
        >
          Previous
        </ButtonLink>
      ) : (
        <span aria-hidden className={disabled}>
          Previous
        </span>
      )}

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden
            className="px-1 text-sm text-muted"
          >
            …
          </span>
        ) : (
          <ButtonLink
            key={item}
            href={projectFiltersHref(filters, item)}
            variant={item === meta.current_page ? "primary" : "secondary"}
            size="sm"
            aria-current={item === meta.current_page ? "page" : undefined}
            className={cn(
              "min-w-9 px-3",
              item === meta.current_page && "pointer-events-none",
            )}
          >
            {item}
          </ButtonLink>
        ),
      )}

      {meta.current_page < meta.last_page ? (
        <ButtonLink
          href={projectFiltersHref(filters, meta.current_page + 1)}
          variant="secondary"
          size="sm"
          rel="next"
        >
          Next
        </ButtonLink>
      ) : (
        <span aria-hidden className={disabled}>
          Next
        </span>
      )}
    </nav>
  );
}