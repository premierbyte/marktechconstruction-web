"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { deleteMedia, listMedia, updateMedia, uploadMedia, type MediaAsset } from "@/features/admin/shared/api";
import { AdminCard, ErrorBanner, Field, inputClass, PageHeader, Spinner } from "@/features/admin/shared/components/ui";
import { Badge, EmptyState, Pagination, SearchInput } from "@/features/admin/shared/components/primitives";

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState("public");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const filters = { visibility, per_page: "24", search, page: String(page) };

  const query = useQuery({
    queryKey: ["admin", "media", filters],
    queryFn: () => listMedia(filters),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "media"] });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a file first.");
      const form = new FormData();
      form.append("file", file);
      if (altText) form.append("alt_text", altText);
      return uploadMedia(form);
    },
    onSuccess: () => {
      setFile(null);
      setAltText("");
      setMessage("Image uploaded.");
      invalidate();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Upload failed."),
  });

  const update = useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) => updateMedia(id, { alt_text: alt }),
    onSuccess: invalidate,
    onError: (error) => setMessage(error instanceof Error ? error.message : "Alt text could not be saved."),
  });

  const remove = useMutation({
    mutationFn: deleteMedia,
    onSuccess: invalidate,
    onError: (error) => setMessage(error instanceof Error ? error.message : "Delete failed."),
  });

  const assets: MediaAsset[] = query.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media library"
        description="Approved public images. Private enquiry uploads never appear here."
      />

      <AdminCard>
        <h2 className="text-sm font-semibold text-ink">Upload public image</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Image file" htmlFor="media-file" hint="JPEG or PNG.">
            <input id="media-file" type="file" accept="image/jpeg,image/png" className={inputClass} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </Field>
          <Field label="Alt text" htmlFor="media-alt" required>
            <input id="media-alt" className={inputClass} value={altText} onChange={(event) => setAltText(event.target.value)} />
          </Field>
          <Button type="button" disabled={!file || !altText.trim() || upload.isPending} onClick={() => upload.mutate()}>
            {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      </AdminCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search file name"
          className="sm:max-w-xs"
        />
        <Field label="Visibility" htmlFor="media-visibility">
          <select
            id="media-visibility"
            className={inputClass}
            value={visibility}
            onChange={(event) => {
              setVisibility(event.target.value);
              setPage(1);
            }}
          >
            <option value="public">Public</option>
            <option value="private">Private (enquiry uploads)</option>
          </select>
        </Field>
      </div>

      {query.isLoading ? <Spinner label="Loading media" /> : null}
      {query.isError ? <ErrorBanner message="Media could not be loaded." onRetry={() => query.refetch()} /> : null}

      {assets.length === 0 && query.data ? (
        <EmptyState icon={ImageIcon} title="No media found" description="Upload an approved public image to get started." />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <AdminCard key={asset.id} className="space-y-3">
            {asset.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt={asset.alt_text ?? ""} className="aspect-[4/3] w-full rounded-xl object-cover" />
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center rounded-xl bg-mist text-xs text-muted">
                {asset.visibility === "private" ? "Private file" : "No preview"}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 text-xs">
              <Badge tone={asset.scan_status === "rejected" ? "danger" : "neutral"}>
                {asset.scan_status === "not_applicable" ? "public" : asset.scan_status}
              </Badge>
              <span className="text-muted">{Math.round(asset.size_bytes / 1024)} KB</span>
            </div>
            <p className="truncate text-xs text-muted">{asset.original_name}</p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink" htmlFor={`alt-${asset.id}`}>
                Alt text
              </label>
              <input
                id={`alt-${asset.id}`}
                className={inputClass}
                defaultValue={asset.alt_text ?? ""}
                onChange={(event) => setAltDrafts((current) => ({ ...current, [asset.id]: event.target.value }))}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={update.isPending}
                  onClick={() => update.mutate({ id: asset.id, alt: altDrafts[asset.id] ?? asset.alt_text ?? "" })}
                >
                  Save alt
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={remove.isPending || asset.claimed}
                  onClick={() => {
                    const isPublic = asset.visibility === "public";
                    const prompt = isPublic
                      ? "Archive this media asset? It will be hidden from the library and can no longer be referenced. Existing published pages keep working."
                      : "Delete this media asset?";
                    if (window.confirm(prompt)) remove.mutate(asset.id);
                  }}
                >
                  {asset.claimed ? "In use" : asset.visibility === "public" ? "Archive" : "Delete"}
                </Button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {query.data?.meta ? (
        <Pagination
          page={query.data.meta.current_page}
          lastPage={query.data.meta.last_page}
          total={query.data.meta.total}
          perPage={query.data.meta.per_page}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
