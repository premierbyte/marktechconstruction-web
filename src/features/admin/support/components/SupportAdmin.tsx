"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { hasPermission } from "@/features/admin/auth/types";
import {
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  listKnowledgeEntries,
  updateKnowledgeEntry,
  type KnowledgeEntry,
} from "@/features/admin/shared/api";
import { DataTable, type Column } from "@/features/admin/shared/components/DataTable";
import { Badge, ConfirmDialog, IconButton, Modal } from "@/features/admin/shared/components/primitives";
import { AdminCard, Field, inputClass, Notice, PageHeader } from "@/features/admin/shared/components/ui";

type Draft = {
  question: string;
  answer: string;
  keywords: string;
  category: string;
  sort_order: number;
  is_published: boolean;
};

const EMPTY_DRAFT: Draft = {
  question: "",
  answer: "",
  keywords: "",
  category: "",
  sort_order: 0,
  is_published: true,
};

const QUERY_KEY = ["admin", "support", "entries"] as const;

export function SupportAdmin() {
  const queryClient = useQueryClient();
  const { data: principal } = usePrincipal();
  const canManage = hasPermission(principal ?? null, "support.manage");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KnowledgeEntry | null>(null);

  const query = useQuery({ queryKey: QUERY_KEY, queryFn: listKnowledgeEntries });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const save = useMutation({
    mutationFn: () => {
      const body = {
        question: draft.question.trim(),
        answer: draft.answer.trim(),
        keywords: draft.keywords
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        category: draft.category.trim() || null,
        sort_order: Number.isFinite(draft.sort_order) ? draft.sort_order : 0,
        is_published: draft.is_published,
      };

      return editing ? updateKnowledgeEntry(editing.id, body) : createKnowledgeEntry(body);
    },
    onSuccess: () => {
      setEditorOpen(false);
      setEditing(null);
      setDraft(EMPTY_DRAFT);
      invalidate();
    },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Could not save this entry."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteKnowledgeEntry(id),
    onSuccess: () => {
      setPendingDelete(null);
      invalidate();
    },
  });

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
    setEditorOpen(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditing(entry);
    setDraft({
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords.join(", "),
      category: entry.category ?? "",
      sort_order: entry.sort_order,
      is_published: entry.is_published,
    });
    setError(null);
    setEditorOpen(true);
  };

  const columns: Column<KnowledgeEntry>[] = [
    {
      key: "question",
      header: "Question",
      sortable: true,
      mobile: "primary",
      sortValue: (row) => row.question,
      cell: (row) => <span className="font-semibold text-ink">{row.question}</span>,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (row) => row.category,
      cell: (row) => <span className="text-muted">{row.category ?? "—"}</span>,
    },
    {
      key: "is_published",
      header: "Status",
      sortable: true,
      sortValue: (row) => (row.is_published ? 1 : 0),
      cell: (row) => (
        <Badge tone={row.is_published ? "success" : "neutral"}>
          {row.is_published ? "published" : "draft"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Order",
      align: "right",
      sortable: true,
      sortValue: (row) => row.sort_order,
      cell: (row) => <span className="text-muted">{row.sort_order}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Knowledge-base entries powering the public support chat."
        actions={
          canManage ? (
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus aria-hidden className="size-4" /> New entry
            </Button>
          ) : undefined
        }
      />

      <AdminCard className="p-0 sm:p-0">
        <p className="border-b border-line px-4 py-3 text-xs text-muted sm:px-6">
          Answers are retrieved from these entries plus approved FAQs, services, sectors and contact details.
        </p>
        <div className="p-4 sm:p-6">
          <DataTable<KnowledgeEntry>
            rows={query.data ?? []}
            columns={columns}
            getRowId={(row) => row.id}
            loading={query.isLoading}
            error={query.isError ? "Knowledge entries could not be loaded." : null}
            onRetry={() => query.refetch()}
            emptyTitle="No knowledge entries"
            emptyDescription="Add an entry to cover a common question, or rely on the auto-derived FAQs and services."
            emptyAction={
              canManage ? (
                <Button type="button" size="sm" onClick={openCreate}>
                  Add the first entry
                </Button>
              ) : undefined
            }
            actions={
              canManage
                ? (row) => (
                    <div className="flex items-center justify-end gap-1">
                      <IconButton label="Edit entry" icon={Pencil} size="sm" onClick={() => openEdit(row)} />
                      <IconButton
                        label="Delete entry"
                        icon={Trash2}
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingDelete(row)}
                      />
                    </div>
                  )
                : undefined
            }
          />
        </div>
      </AdminCard>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "Edit knowledge entry" : "New knowledge entry"}
        description="Visitors get the answer that best matches their question."
        size="lg"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            save.mutate();
          }}
          className="space-y-4"
        >
          {error ? <Notice tone="warning">{error}</Notice> : null}

          <Field label="Question" htmlFor="kb-question" required hint="Phrase it the way a visitor would ask.">
            <input
              id="kb-question"
              className={inputClass}
              value={draft.question}
              onChange={(event) => setDraft({ ...draft, question: event.target.value })}
              maxLength={200}
              required
            />
          </Field>

          <Field label="Answer" htmlFor="kb-answer" required>
            <textarea
              id="kb-answer"
              className={`${inputClass} min-h-32 py-2`}
              value={draft.answer}
              onChange={(event) => setDraft({ ...draft, answer: event.target.value })}
              maxLength={5000}
              required
            />
          </Field>

          <Field label="Keywords" htmlFor="kb-keywords" hint="Comma separated terms that should trigger this answer.">
            <input
              id="kb-keywords"
              className={inputClass}
              value={draft.keywords}
              onChange={(event) => setDraft({ ...draft, keywords: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="kb-category">
              <input
                id="kb-category"
                className={inputClass}
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Sort order" htmlFor="kb-order">
              <input
                id="kb-order"
                type="number"
                min={0}
                max={9999}
                className={inputClass}
                value={draft.sort_order}
                onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={draft.is_published}
              onChange={(event) => setDraft({ ...draft, is_published: event.target.checked })}
            />
            Published to the public chat
          </label>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditorOpen(false)}
              disabled={save.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={save.isPending || draft.question.trim() === "" || draft.answer.trim() === ""}
            >
              {save.isPending ? "Saving..." : editing ? "Save changes" : "Create entry"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        title="Delete knowledge entry"
        description={pendingDelete ? `Delete “${pendingDelete.question}”? This cannot be undone.` : undefined}
        confirmLabel="Delete"
        pending={remove.isPending}
      />
    </div>
  );
}