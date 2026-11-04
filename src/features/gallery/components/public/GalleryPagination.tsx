import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryMeta } from "../../types";
import { galleryHref, type GalleryFilters } from "../../utils/pagination";

function pageWindow(current: number, last: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, last, current, current - 1, current + 1]);

  if (current <= 3) {
    [2, 3, 4].forEach((page) => {
      if (page <= last) pages.add(page);
    });
  }

  if (current >= last - 2) {
    [last - 1, last - 2, last - 3].forEach((page) => {
      if (page >= 1) pages.add(page);
    });
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b);

  const output: (number | "ellipsis")[] = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      output.push("ellipsis");
    }
    output.push(page);
  });

  return output;
}

export function GalleryPagination({
  meta,
  filters,
}: {
  meta: GalleryMeta;
  filters: GalleryFilters;
}) {
  if (meta.last_page <= 1) {
    return null;
  }

  const previous = meta.current_page - 1;
  const next = meta.current_page + 1;

  return (
    <nav
      aria-label="Gallery pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {meta.current_page > 1 ? (
        <Link
          href={galleryHref({ ...filters, page: previous })}
          className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line px-4 text-sm font-semibold text-forest hover:bg-mist"
        >
          <ChevronLeft aria-hidden className="size-4" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line/60 px-4 text-sm font-semibold text-muted/50">
          <ChevronLeft aria-hidden className="size-4" />
          Previous
        </span>
      )}

      {pageWindow(meta.current_page, meta.last_page).map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-muted" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={galleryHref({ ...filters, page })}
            aria-current={page === meta.current_page ? "page" : undefined}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
              page === meta.current_page
                ? "border-forest bg-forest text-white"
                : "border-line text-forest hover:bg-mist",
            )}
          >
            {page}
          </Link>
        ),
      )}

      {meta.current_page < meta.last_page ? (
        <Link
          href={galleryHref({ ...filters, page: next })}
          className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line px-4 text-sm font-semibold text-forest hover:bg-mist"
        >
          Next
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line/60 px-4 text-sm font-semibold text-muted/50">
          Next
          <ChevronRight aria-hidden className="size-4" />
        </span>
      )}
    </nav>
  );
}