"use client";

import { useState } from "react";
import { Images, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  AdminCard,
  ErrorBanner,
  Field,
  inputClass,
  Notice,
  PageHeader,
  Spinner,
} from "@/features/admin/shared/components/ui";
import {
  EmptyState,
  Pagination,
  SearchInput,
  Skeleton,
} from "@/features/admin/shared/components/primitives";
import {
  deleteGallery,
  listGallery,
  updateGallery,
  uploadGallery,
} from "../api";

const PER_PAGE = 12;

type DetailDraft = { alt_text: string; caption: string };

export function GalleryManager() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [year, setYear] = useState("");
  const [orientation, setOrientation] = useState("");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [drafts, setDrafts] = useState<Record<string, DetailDraft>>({});
  const [message, setMessage] = useState<string | null>(null);

  const filters = {
    page: String(page),
    per_page: String(PER_PAGE),
    sort,
    ...(search ? { search } : {}),
    ...(year ? { year } : {}),
    ...(orientation ? { orientation } : {}),
  };

  const query = useQuery({
    queryKey: ["admin", "gallery", filters],
    queryFn: () => listGallery(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose an image first.");
      const form = new FormData();
      form.append("file", file);
      form.append("alt_text", alt.trim());
      if (caption.trim()) form.append("caption", caption.trim());
      return uploadGallery(form);
    },
    onSuccess: () => {
      setFile(null);
      setAlt("");
      setCaption("");
      setMessage("Image added to the gallery.");
      setPage(1);
      invalidate();
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Upload failed."),
  });

  const update = useMutation({
    mutationFn: (draft: DetailDraft & { id: string }) =>
      updateGallery(draft.id, {
        alt_text: draft.alt_text,
        caption: draft.caption,
      }),
    onSuccess: () => {
      setMessage("Image details saved.");
      invalidate();
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Save failed."),
  });

  const remove = useMutation({
    mutationFn: deleteGallery,
    onSuccess: () => {
      setMessage("Image removed from the gallery.");
      invalidate();
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Delete failed."),
  });

  const images = query.data?.data ?? [];
  const meta = query.data?.meta;
  const years = query.data?.filters?.years ?? [];

  const draftFor = (id: string, fallback: DetailDraft): DetailDraft =>
    drafts[id] ?? fallback;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        description="Upload and manage project photographs. Images are stored in the gallery-img folder and published to the public gallery immediately."
      />

      {message ? <Notice>{message}</Notice> : null}

      <AdminCard>
        <h2 className="text-sm font-semibold text-ink">Upload image</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
          <Field label="Image file" htmlFor="gallery-file" hint="JPEG or PNG.">
            <input
              id="gallery-file"
              type="file"
              accept="image/jpeg,image/png"
              className={inputClass}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </Field>
          <Field label="Alt text" htmlFor="gallery-alt" required>
            <input
              id="gallery-alt"
              className={inputClass}
              value={alt}
              maxLength={300}
              placeholder="Describe the photograph"
              onChange={(event) => setAlt(event.target.value)}
            />
          </Field>
          <Field label="Caption" htmlFor="gallery-caption">
            <input
              id="gallery-caption"
              className={inputClass}
              value={caption}
              maxLength={300}
              placeholder="Optional caption"
              onChange={(event) => setCaption(event.target.value)}
            />
          </Field>
          <Button
            type="button"
            disabled={!file || !alt.trim() || upload.isPending}
            onClick={() => upload.mutate()}
          >
            <Upload aria-hidden className="size-4" />
            {upload.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </AdminCard>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search file name, alt or caption"
            className="w-full sm:w-64"
          />
          <Field label="Year" htmlFor="gallery-filter-year">
            <select
              id="gallery-filter-year"
              className={inputClass}
              value={year}
              onChange={(event) => {
                setYear(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All years</option>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Orientation" htmlFor="gallery-filter-orientation">
            <select
              id="gallery-filter-orientation"
              className={inputClass}
              value={orientation}
              onChange={(event) => {
                setOrientation(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Any orientation</option>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
              <option value="square">Square</option>
            </select>
          </Field>
          <Field label="Sort by" htmlFor="gallery-sort">
            <select
              id="gallery-sort"
              className={inputClass}
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as typeof sort);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </Field>
        </div>
        <p className="text-xs text-muted">
          {meta ? `${meta.total} gallery ${meta.total === 1 ? "image" : "images"}` : ""}
        </p>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-line bg-white p-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-2 h-9 w-full" />
            </div>
          ))}
        </div>
      ) : null}

      {query.isError ? (
        <ErrorBanner
          message="Gallery images could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : null}

      {!query.isLoading && images.length === 0 ? (
        <EmptyState
          icon={Images}
          title={
            search || year || orientation
              ? "No images match these filters"
              : "No gallery images yet"
          }
          description={
            search || year || orientation
              ? "Try a different search, year or orientation."
              : "Upload an approved public image above to start the gallery."
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => {
          const draft = draftFor(image.id, {
            alt_text: image.alt_text ?? "",
            caption: image.caption ?? "",
          });

          return (
            <AdminCard key={image.id} className="space-y-3">
              {image.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url}
                  alt={image.alt_text ?? ""}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center rounded-xl bg-mist text-xs text-muted">
                  No preview
                </div>
              )}

              <div className="flex items-center justify-between gap-2 text-xs text-muted">
                <span className="truncate">{image.original_name}</span>
                <span className="shrink-0">
                  {Math.round(image.size_bytes / 1024)} KB
                </span>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-semibold text-ink"
                  htmlFor={`alt-${image.id}`}
                >
                  Alt text
                </label>
                <input
                  id={`alt-${image.id}`}
                  className={inputClass}
                  value={draft.alt_text}
                  maxLength={300}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [image.id]: { ...draft, alt_text: event.target.value },
                    }))
                  }
                />
                <label
                  className="text-xs font-semibold text-ink"
                  htmlFor={`caption-${image.id}`}
                >
                  Caption
                </label>
                <input
                  id={`caption-${image.id}`}
                  className={inputClass}
                  value={draft.caption}
                  maxLength={300}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [image.id]: { ...draft, caption: event.target.value },
                    }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={update.isPending || !draft.alt_text.trim()}
                  onClick={() => update.mutate({ id: image.id, ...draft })}
                >
                  Save details
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this image from the gallery? The file is archived and existing pages keep working.",
                      )
                    ) {
                      remove.mutate(image.id);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {meta ? (
        <Pagination
          page={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={setPage}
        />
      ) : null}

      {query.isFetching && !query.isLoading ? (
        <Spinner label="Refreshing gallery" />
      ) : null}
    </div>
  );
}