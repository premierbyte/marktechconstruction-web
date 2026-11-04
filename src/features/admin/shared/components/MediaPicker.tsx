"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteMedia, listMedia, type MediaAsset } from "@/features/admin/shared/api";
import { Pagination } from "@/features/admin/shared/components/primitives";

const PER_PAGE = 12;

export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin", "media", "picker", { page }],
    queryFn: () => listMedia({ visibility: "public", per_page: String(PER_PAGE), page: String(page) }),
    enabled: open,
  });

  const remove = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  if (!open) return null;

  const assets = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose media"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="text-lg font-semibold text-ink">Choose media</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media picker"
            className="rounded-full p-2 text-forest hover:bg-mist"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {query.isLoading ? (
            <p className="text-sm text-muted">Loading media...</p>
          ) : null}
          {query.data && assets.length === 0 ? (
            <p className="text-sm text-muted">
              No public media yet. Upload images in the Media library first.
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col overflow-hidden rounded-xl border border-line"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="block flex-1 text-left transition-colors hover:bg-forest/5"
                >
                  {asset.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.alt_text ?? ""}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <span className="grid aspect-[4/3] place-items-center bg-mist text-xs text-muted">
                      No preview
                    </span>
                  )}
                  <span className="block truncate p-2 text-xs text-ink">
                    {asset.alt_text || asset.original_name}
                  </span>
                </button>
                <div className="border-t border-line p-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm("Delete this media asset?")) {
                        remove.mutate(asset.id);
                      }
                    }}
                  >
                    <Trash2 aria-hidden className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {meta && meta.last_page > 1 ? (
          <div className="border-t border-line px-4 py-2">
            <Pagination
              page={meta.current_page}
              lastPage={meta.last_page}
              total={meta.total}
              perPage={meta.per_page}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}