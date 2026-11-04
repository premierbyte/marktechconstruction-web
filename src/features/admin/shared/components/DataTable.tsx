"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "@/features/admin/shared/components/ui";
import { EmptyState, Pagination, SearchInput, TableSkeleton, Toolbar } from "@/features/admin/shared/components/primitives";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null | undefined;
  align?: "left" | "right";
  className?: string;
  headerClassName?: string;
  /** How this column appears in the mobile card layout. */
  mobile?: "primary" | "secondary" | "hidden";
};

type SortDir = "asc" | "desc";

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  actions,
  actionsHeader = "Actions",
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon,
  emptyAction,
  search,
  toolbar,
  initialSort,
  paginate = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  actions?: (row: T) => ReactNode;
  actionsHeader?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: ReactNode;
  search?: { value: string; onChange: (value: string) => void; placeholder?: string; filterFn: (row: T, term: string) => boolean } | null;
  toolbar?: ReactNode;
  initialSort?: { key: string; dir: SortDir };
  paginate?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}) {
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initialSort?.dir ?? "asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(pageSize);

  const term = search?.value.trim().toLowerCase() ?? "";

  const filtered = useMemo(() => {
    if (!search || term === "") return rows;
    return rows.filter((row) => search.filterFn(row, term));
  }, [rows, search, term]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    const column = columns.find((candidate) => candidate.key === sortKey);
    if (!column?.sortValue) return filtered;

    const copy = [...filtered];
    copy.sort((a, b) => {
      const left = column.sortValue?.(a);
      const right = column.sortValue?.(b);

      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;

      const comparison =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right), undefined, { sensitivity: "base" });

      return sortDir === "asc" ? comparison : -comparison;
    });

    return copy;
  }, [filtered, columns, sortKey, sortDir]);

  const lastPage = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(Math.max(page, 1), lastPage);

  const paged = useMemo(() => {
    if (!paginate) return sorted;
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, currentPage, perPage, paginate]);

  const toggleSort = (column: Column<T>) => {
    if (!column.sortable || !column.sortValue) return;

    setPage(1);

    if (sortKey === column.key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDir("asc");
    }
  };

  const hasToolbar = Boolean(search || toolbar);

  return (
    <div className="space-y-4">
      {hasToolbar ? (
        <Toolbar>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {search ? (
              <SearchInput
                value={search.value}
                onChange={(value) => {
                  setPage(1);
                  search.onChange(value);
                }}
                placeholder={search.placeholder ?? "Search"}
                className="sm:max-w-xs"
              />
            ) : null}
            {toolbar}
          </div>
        </Toolbar>
      ) : null}

      {loading ? <TableSkeleton columns={Math.min(columns.length, 4)} /> : null}

      {!loading && error ? <ErrorBanner message={error} onRetry={onRetry} /> : null}

      {!loading && !error && sorted.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : null}

      {!loading && !error && sorted.length > 0 ? (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={cn(
                          "border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted",
                          column.align === "right" && "text-right",
                          column.headerClassName,
                        )}
                      >
                        {column.sortable && column.sortValue ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(column)}
                            className={cn(
                              "inline-flex items-center gap-1 hover:text-ink",
                              column.align === "right" && "flex-row-reverse",
                            )}
                          >
                            {column.header}
                            {sortKey === column.key ? (
                              sortDir === "asc" ? (
                                <ChevronUp aria-hidden className="size-3.5" />
                              ) : (
                                <ChevronDown aria-hidden className="size-3.5" />
                              )
                            ) : (
                              <ChevronsUpDown aria-hidden className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    ))}
                    {actions ? (
                      <th scope="col" className="border-b border-line px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                        {actionsHeader}
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row) => (
                    <tr key={getRowId(row)} className="group transition-colors hover:bg-forest/[0.03]">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "border-b border-line/60 px-4 py-3 align-middle text-ink",
                            column.align === "right" && "text-right",
                            column.className,
                          )}
                        >
                          {column.cell(row)}
                        </td>
                      ))}
                      {actions ? <td className="border-b border-line/60 px-4 py-3 text-right">{actions(row)}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paged.map((row) => {
              const primary = columns.find((column) => column.mobile === "primary") ?? columns[0];
              const details = columns.filter((column) => column.mobile !== "hidden" && column.key !== primary.key);

              return (
                <div key={getRowId(row)} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 font-semibold text-ink">{primary.cell(row)}</div>
                    {actions ? <div className="shrink-0">{actions(row)}</div> : null}
                  </div>
                  {details.length > 0 ? (
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {details.map((column) => (
                        <div key={column.key} className="min-w-0">
                          <dt className="text-muted">{column.header}</dt>
                          <dd className="mt-0.5 break-words text-ink">{column.cell(row)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", !paginate && "hidden")}>
            <Pagination page={currentPage} lastPage={lastPage} total={sorted.length} perPage={perPage} onPageChange={setPage} />
            {lastPage > 1 && pageSizeOptions.length > 0 ? (
              <label className="flex items-center gap-2 text-xs text-muted">
                Rows per page
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs text-ink"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
