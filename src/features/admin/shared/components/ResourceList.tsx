"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteResource, listResource } from "@/features/admin/shared/api";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { hasPermission } from "@/features/admin/auth/types";
import type { ResourceConfig } from "@/features/admin/shared/resources";
import { AdminCard, inputClass, PageHeader } from "@/features/admin/shared/components/ui";
import { Badge, ConfirmDialog, IconButton, Modal, stateTone } from "@/features/admin/shared/components/primitives";
import { DataTable, type Column } from "@/features/admin/shared/components/DataTable";

type Row = Record<string, unknown>;

export function ResourceList({ config }: { config: ResourceConfig }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: principal } = usePrincipal();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const canEdit = config.singleton ? true : hasPermission(principal ?? null, config.permissionEdit);
  const canDelete = hasPermission(principal ?? null, config.permissionPublish);

  const listUrl = config.listQuery ? `${config.api}?${new URLSearchParams(config.listQuery).toString()}` : config.api;

  const query = useQuery({
    queryKey: ["admin", "resource", config.key, "list"],
    queryFn: () => listResource<Row>(listUrl),
    enabled: !config.singleton,
  });

  const remove = useMutation({
    mutationFn: (slug: string) => deleteResource(config.api, slug),
    onSuccess: () => {
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "resource", config.key, "list"] });
    },
  });

  const create = (event: React.FormEvent) => {
    event.preventDefault();
    const slug = newSlug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return;
    setCreateOpen(false);
    setNewSlug("");
    router.push(`${config.slugBase}/${slug}`);
  };

  const columns: Column<Row>[] = config.columns.map((column, index) => ({
    key: column.key,
    header: column.label,
    sortable: true,
    mobile: index === 0 ? "primary" : undefined,
    sortValue: (row) =>
      column.key === "title"
        ? String(row[config.titleKey] ?? row.title ?? row.slug ?? "")
        : String(row[column.key] ?? ""),
    cell: (row) => {
      const slug = String(row.slug ?? "");

      if (column.key === "state") {
        const state = String(row.state ?? "draft");
        return <Badge tone={stateTone(state)}>{state.replace(/_/g, " ")}</Badge>;
      }

      if (column.key === "title") {
        return (
          <Link href={`${config.slugBase}/${slug}`} className="font-semibold text-ink hover:text-forest">
            {String(row[config.titleKey] ?? row.title ?? slug)}
          </Link>
        );
      }

      if (column.key === "slug") {
        return <span className="font-mono text-xs text-muted">{slug || "—"}</span>;
      }

      return <span className="text-muted">{row[column.key] ? String(row[column.key]) : "—"}</span>;
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          canEdit ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden className="size-4" /> New
            </Button>
          ) : null
        }
      />

      {config.singleton ? (
        <AdminCard>
          <p className="text-sm text-muted">This resource is a singleton. Open it to manage its content.</p>
          <Link className="mt-3 inline-block font-semibold text-forest underline" href={config.slugBase}>
            Open {config.title}
          </Link>
        </AdminCard>
      ) : (
        <DataTable<Row>
          rows={query.data ?? []}
          columns={columns}
          getRowId={(row) => String(row.slug ?? "")}
          loading={query.isLoading}
          error={query.isError ? "Records could not be loaded." : null}
          onRetry={() => query.refetch()}
          search={{
            value: search,
            onChange: setSearch,
            placeholder: `Search ${config.title.toLowerCase()}`,
            filterFn: (row, term) => {
              const haystack = [row.slug, row.title, row[config.titleKey], row.state]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return haystack.includes(term);
            },
          }}
          emptyIcon={config.singleton ? undefined : Plus}
          emptyTitle="Nothing has been created yet"
          emptyDescription="Create a new record to get started."
          emptyAction={
            canEdit ? (
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus aria-hidden className="size-4" /> New
              </Button>
            ) : undefined
          }
          actions={(row) => {
            const slug = String(row.slug ?? "");
            return (
              <div className="flex items-center justify-end gap-1">
                <Link href={`${config.slugBase}/${slug}`} aria-label={`Open ${slug}`} title="Open" className="inline-grid size-8 place-items-center rounded-lg text-forest hover:bg-forest/5">
                  <Eye aria-hidden className="size-4" />
                </Link>
                {canDelete ? (
                  <IconButton label="Delete" icon={Trash2} variant="danger" size="sm" onClick={() => setPendingDelete(row)} />
                ) : null}
              </div>
            );
          }}
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={`New ${config.title.replace(/s$/, "")}`}
        description="Choose a URL slug. You can edit the content on the next screen."
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-resource-form" size="sm" disabled={!newSlug.trim()}>
              Continue
            </Button>
          </>
        }
      >
        <form id="create-resource-form" onSubmit={create}>
          <label htmlFor="new-slug" className="mb-1.5 block text-sm font-semibold text-ink">
            Slug <span className="text-clay">*</span>
          </label>
          <input
            id="new-slug"
            data-autofocus
            className={inputClass}
            value={newSlug}
            onChange={(event) => setNewSlug(event.target.value)}
            placeholder="e.g. new-service"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
          <p className="mt-1.5 text-xs text-muted">Lowercase letters, numbers and hyphens only.</p>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(String(pendingDelete.slug ?? ""))}
        title="Delete this record?"
        description="Published content is archived rather than permanently removed. This cannot be undone from the list."
        confirmLabel="Delete"
        pending={remove.isPending}
      />
    </div>
  );
}
