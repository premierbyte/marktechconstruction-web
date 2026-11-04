"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { hasPermission } from "@/features/admin/auth/types";
import {
  deleteResource,
  getEditorAt,
  listRevisionsAt,
  runWorkflowAt,
  saveDraftAt,
  type EditorState,
  type MediaAsset,
} from "@/features/admin/shared/api";
import type { FieldDef, ResourceConfig } from "@/features/admin/shared/resources";
import { MediaPicker } from "@/features/admin/shared/components/MediaPicker";
import { RichTextEditor } from "@/features/admin/shared/components/RichTextEditor";
import { RichText } from "@/components/ui/RichText";
import { AdminCard, ErrorBanner, Field, inputClass, Notice, Spinner, StatusBadge } from "@/features/admin/shared/components/ui";

type Obj = Record<string, unknown>;

function getPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((carry, key) => {
    if (carry !== null && typeof carry === "object") return (carry as Obj)[key];
    return undefined;
  }, source);
}

function setPath(source: Obj, path: string, value: unknown): Obj {
  const keys = path.split(".");
  const clone: Obj = { ...source };
  let cursor: Obj = clone;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }

    const next = cursor[key];
    cursor[key] = next !== null && typeof next === "object" ? { ...(next as Obj) } : {};
    cursor = cursor[key] as Obj;
  });

  return clone;
}

function defaultDraft(config: ResourceConfig, payload: Obj | null): Obj {
  const draft: Obj = structuredClone(payload ?? {});

  config.fields.forEach((field) => {
    const current = getPath(draft, field.name);

    if (field.type === "string-list" || field.type === "pair-list" || field.type === "faq-list" || field.type === "member-list" || field.type === "media-list") {
      if (!Array.isArray(current)) setValue(draft, field.name, []);
    } else if (field.type === "checkbox") {
      if (typeof current !== "boolean") setValue(draft, field.name, false);
    } else if (field.type === "select") {
      if (typeof current !== "string") setValue(draft, field.name, field.options?.[0]?.value ?? "");
    }
  });

  Object.entries(config.defaults ?? {}).forEach(([path, value]) => {
    if (getPath(draft, path) === undefined) setValue(draft, path, value);
  });

  if (config.key === "projects" && typeof getPath(draft, "status") !== "string") {
    setValue(draft, "status", "completed");
  }

  return draft;
}

function setValue(draft: Obj, path: string, value: unknown): void {
  const updated = setPath(draft, path, value);
  Object.keys(draft).forEach((key) => delete draft[key]);
  Object.assign(draft, updated);
}

function stateTone(state: string) {
  if (state === "published") return "forest" as const;
  if (state === "archived") return "clay" as const;
  return "neutral" as const;
}

export function ResourceEditor({ config, slug }: { config: ResourceConfig; slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: principal } = usePrincipal();
  const baseUrl = config.singleton ? config.api : `${config.api}/${encodeURIComponent(slug)}`;
  const queryKey = ["admin", "resource", config.key, config.singleton ? "singleton" : slug];

  const editor = useQuery({ queryKey, queryFn: () => getEditorAt(baseUrl) });
  const revisions = useQuery({
    queryKey: ["admin", "resource", config.key, config.singleton ? "singleton" : slug, "revisions"],
    queryFn: () => listRevisionsAt(baseUrl),
    enabled: !config.singleton,
  });

  const [draft, setDraft] = useState<Obj | null>(null);
  const [baseline, setBaseline] = useState<Obj | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [picker, setPicker] = useState<null | { kind: "field"; name: string } | { kind: "gallery"; index: number } | { kind: "member"; index: number }>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!editor.data) return;

    const key = String(editor.data.current_version);
    if (hydratedFor.current === key) return;

    const next = defaultDraft(config, editor.data.payload);
    hydratedFor.current = key;
    setDraft(structuredClone(next));
    setBaseline(structuredClone(next));
  }, [editor.data, config]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["admin", "resource", config.key, "list"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "resource", config.key, config.singleton ? "singleton" : slug, "revisions"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!draft || !editor.data) throw new Error("Nothing to save.");
      return saveDraftAt(baseUrl, draft, editor.data.current_version);
    },
    onSuccess: (state) => {
      setFeedback("Draft saved.");
      setStale(false);
      hydratedFor.current = String(state.current_version);
      const next = defaultDraft(config, state.payload);
      setDraft(structuredClone(next));
      setBaseline(structuredClone(next));
      queryClient.setQueryData(queryKey, state);
      invalidate();
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isStale) {
        setStale(true);
        setFeedback("This record changed since you opened it.");
      } else {
        setFeedback(error instanceof Error ? error.message : "Save failed.");
      }
    },
  });

  const workflow = useMutation({
    mutationFn: (input: { action: "submit-review" | "approve" | "publish" | "archive"; body?: Obj }) =>
      runWorkflowAt(baseUrl, input.action, input.body),
    onSuccess: (_data, input) => {
      setFeedback(`Action “${input.action}” completed.`);
      editor.refetch();
      invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Action failed."),
  });

  const schedule = useMutation({
    mutationFn: (cancel: boolean) =>
      runWorkflowAt(baseUrl, "schedule", cancel ? { cancel: true } : { run_at: new Date(scheduleAt).toISOString(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    onSuccess: (_data, cancel) => {
      setFeedback(cancel ? "Schedule cancelled." : "Publication scheduled.");
      setScheduleOpen(false);
      invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Scheduling failed."),
  });

  const restore = useMutation({
    mutationFn: (revisionId: string) => runWorkflowAt(baseUrl, "restore", { revision_id: revisionId }),
    onSuccess: () => {
      setFeedback("Revision restored and published.");
      editor.refetch();
      invalidate();
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Restore failed."),
  });

  const remove = useMutation({
    mutationFn: () => deleteResource(config.api, slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resource", config.key, "list"] });
      router.push(config.slugBase);
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Delete failed."),
  });

  if (editor.isLoading) return <Spinner label="Loading editor" />;
  if (editor.isError) {
    return <ErrorBanner message={editor.error instanceof Error ? editor.error.message : "Could not load this record."} onRetry={() => editor.refetch()} />;
  }
  if (!editor.data || !draft) return null;

  const state = editor.data.state;
  const dirty = baseline ? JSON.stringify(draft) !== JSON.stringify(baseline) : false;
  const canEdit = hasPermission(principal ?? null, config.permissionEdit) || config.singleton;
  const canPublish = hasPermission(principal ?? null, config.permissionPublish);

  const fieldValue = (field: FieldDef) => getPath(draft, field.name);

  const onPick = (asset: MediaAsset) => {
    if (!picker) return;

    if (picker.kind === "field") {
      setDraft((current) => {
        const next = structuredClone(current ?? {});
        setValue(next, picker.name, asset.id);
        return next;
      });
    } else if (picker.kind === "member") {
      setDraft((current) => {
        const next = structuredClone(current ?? {});
        const members = Array.isArray(getPath(next, "members")) ? ([...(getPath(next, "members") as Obj[])] as Obj[]) : [];
        members[picker.index] = {
          ...members[picker.index],
          avatar_asset_id: asset.id,
          avatar: { asset_id: asset.id, url: asset.url, alt: asset.alt_text },
        };
        setValue(next, "members", members);
        return next;
      });
    } else {
      setDraft((current) => {
        const next = structuredClone(current ?? {});
        const gallery = Array.isArray(getPath(next, "gallery")) ? ([...(getPath(next, "gallery") as Obj[])] as Obj[]) : [];
        gallery[picker.index] = { ...gallery[picker.index], asset_id: asset.id };
        setValue(next, "gallery", gallery);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link className="text-xs font-semibold uppercase tracking-wide text-muted hover:text-forest" href={config.singleton ? "/admin" : config.slugBase}>
            ← {config.title}
          </Link>
          <h1 className="display mt-2 text-3xl text-ink">
            {config.singleton ? config.title : String(getPath(draft, config.titleKey) ?? slug)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            {!config.singleton ? <span className="font-mono">{slug}</span> : null}
            <StatusBadge value={state} tone={stateTone(state)} />
            <span>Version {editor.data.current_version}</span>
            {editor.data.published ? <span>Live</span> : <span>Not live</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => save.mutate()} disabled={!canEdit || !dirty || save.isPending}>
            {save.isPending ? "Saving…" : "Save draft"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => editor.refetch()} disabled={editor.isFetching}>
            Reload
          </Button>
        </div>
      </div>

      {feedback ? <Notice>{feedback}</Notice> : null}

      {stale ? (
        <Notice tone="warning">
          Another editor changed this record. Reload to review the differences before saving again.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              hydratedFor.current = null;
              setStale(false);
              editor.refetch();
            }}
          >
            Reload now
          </button>
        </Notice>
      ) : null}

      {canPublish && (!config.singleton || config.singletonWorkflow) ? (
        <AdminCard>
          <h2 className="text-sm font-semibold text-ink">Workflow</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" disabled={workflow.isPending || state !== "draft"} onClick={() => workflow.mutate({ action: "submit-review" })}>
              Submit for review
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={workflow.isPending || state !== "in_review"} onClick={() => workflow.mutate({ action: "approve" })}>
              Approve
            </Button>
            <Button type="button" size="sm" disabled={workflow.isPending || state !== "approved"} onClick={() => workflow.mutate({ action: "publish" })}>
              Publish
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={workflow.isPending || state !== "approved"} onClick={() => setScheduleOpen((value) => !value)}>
              Schedule
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={workflow.isPending || !editor.data.published} onClick={() => workflow.mutate({ action: "archive" })}>
              Archive
            </Button>
            {!config.singleton ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (window.confirm("Archive and remove this record? This cannot be undone from the workspace.")) remove.mutate();
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>

          {scheduleOpen ? (
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <Field label="Publish at" htmlFor="schedule-at">
                <input id="schedule-at" type="datetime-local" className={inputClass} value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} />
              </Field>
              <Button type="button" size="sm" disabled={!scheduleAt || schedule.isPending} onClick={() => schedule.mutate(false)}>
                Confirm schedule
              </Button>
              <Button type="button" variant="secondary" size="sm" disabled={schedule.isPending} onClick={() => schedule.mutate(true)}>
                Cancel schedule
              </Button>
            </div>
          ) : null}
        </AdminCard>
      ) : null}

      <AdminCard>
        <div className="grid gap-5 md:grid-cols-2">
          {config.fields.map((field) => (
            <div key={field.name} className={field.type === "textarea" || field.type === "rich" || field.type.endsWith("list") || field.type === "media-list" ? "md:col-span-2" : ""}>
              <FieldRender
                field={field}
                value={fieldValue(field)}
                disabled={!canEdit}
                onChange={(value) =>
                  setDraft((current) => {
                    const next = structuredClone(current ?? {});
                    setValue(next, field.name, value);
                    return next;
                  })
                }
                onPickMedia={() => setPicker({ kind: "field", name: field.name })}
                onPickGallery={(index) => setPicker({ kind: "gallery", index })}
                onPickMember={(index) => setPicker({ kind: "member", index })}
              />
            </div>
          ))}
        </div>
      </AdminCard>

      {!config.singleton && revisions.data && revisions.data.length > 0 ? (
        <AdminCard>
          <h2 className="text-sm font-semibold text-ink">Revision history</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {revisions.data.map((revision) => (
              <li key={revision.id} className="flex items-center justify-between gap-4 py-2">
                <span className="text-muted">
                  v{revision.version} · {revision.state}
                  {revision.published_at ? ` · published ${new Date(revision.published_at).toLocaleString()}` : ""}
                </span>
                {canPublish ? (
                  <button type="button" className="font-semibold text-forest underline" disabled={restore.isPending} onClick={() => restore.mutate(revision.id)}>
                    Restore
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      <MediaPicker open={picker !== null} onClose={() => setPicker(null)} onSelect={onPick} />
    </div>
  );
}

function FieldRender({
  field,
  value,
  disabled,
  onChange,
  onPickMedia,
  onPickGallery,
  onPickMember,
}: {
  field: FieldDef;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
  onPickMedia: () => void;
  onPickGallery: (index: number) => void;
  onPickMember: (index: number) => void;
}) {
  const id = `field-${field.name.replace(/\./g, "-")}`;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 text-sm font-semibold text-ink">
        <input id={id} type="checkbox" checked={Boolean(value)} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
        {field.label}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <Field label={field.label} htmlFor={id} required={field.required} hint={field.help}>
        <select id={id} className={inputClass} value={String(value ?? "")} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (field.type === "textarea") {
    return (
      <Field label={field.label} htmlFor={id} required={field.required} hint={field.help}>
        <textarea id={id} rows={6} className={inputClass} value={String(value ?? "")} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      </Field>
    );
  }

  if (field.type === "rich") {
    return (
      <Field label={field.label} htmlFor={id} required={field.required} hint={field.help}>
        {disabled ? (
          <div className="rounded-xl border border-line bg-mist/40 p-3">
            <RichText value={String(value ?? "")} />
          </div>
        ) : (
          <RichTextEditor id={id} ariaLabel={field.label} value={String(value ?? "")} onChange={(html) => onChange(html)} />
        )}
      </Field>
    );
  }

  if (field.type === "string-list") {
    return <StringListField field={field} value={value} disabled={disabled} onChange={onChange} />;
  }

  if (field.type === "pair-list") {
    return <PairListField field={field} value={value} disabled={disabled} onChange={onChange} />;
  }

  if (field.type === "faq-list") {
    return <FaqListField field={field} value={value} disabled={disabled} onChange={onChange} />;
  }

  if (field.type === "media") {
    return (
      <Field label={field.label} htmlFor={id} hint={field.help}>
        <div className="flex items-center gap-2">
          <input id={id} className={inputClass} value={String(value ?? "")} readOnly placeholder="No asset selected" />
          <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={onPickMedia}>
            Choose
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={disabled || !value} onClick={() => onChange("")}>
            Clear
          </Button>
        </div>
      </Field>
    );
  }

  if (field.type === "member-list") {
    return <MemberListField field={field} value={value} disabled={disabled} onChange={onChange} onPickAvatar={onPickMember} />;
  }

  if (field.type === "media-list") {
    return <MediaListField field={field} value={value} disabled={disabled} onChange={onChange} onPickGallery={onPickGallery} />;
  }

  return (
    <Field label={field.label} htmlFor={id} required={field.required} hint={field.help}>
      <input
        id={id}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        className={inputClass}
        value={value === undefined || value === null ? "" : String(value)}
        disabled={disabled}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.type === "number" ? Number.parseInt(event.target.value || "0", 10) : event.target.value)}
      />
    </Field>
  );
}

function StringListField({ field, value, disabled, onChange }: { field: FieldDef; value: unknown; disabled: boolean; onChange: (value: unknown) => void }) {
  const items = Array.isArray(value) ? (value as string[]) : [];

  return (
    <Field label={field.label} htmlFor={`field-${field.name}`} hint={field.help}>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              className={inputClass}
              value={item}
              disabled={disabled}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onChange(items.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onChange([...items, ""])}>
          Add item
        </Button>
      </div>
    </Field>
  );
}

function PairListField({ field, value, disabled, onChange }: { field: FieldDef; value: unknown; disabled: boolean; onChange: (value: unknown) => void }) {
  const items = Array.isArray(value) ? (value as { slug?: string; name?: string }[]) : [];

  return (
    <Field label={field.label} htmlFor={`field-${field.name}`} hint="Slug and display name.">
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label="Slug"
              className={inputClass}
              value={item.slug ?? ""}
              disabled={disabled}
              placeholder="slug"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], slug: event.target.value };
                onChange(next);
              }}
            />
            <input
              aria-label="Name"
              className={inputClass}
              value={item.name ?? ""}
              disabled={disabled}
              placeholder="Display name"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], name: event.target.value };
                onChange(next);
              }}
            />
            <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onChange(items.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onChange([...items, { slug: "", name: "" }])}>
          Add
        </Button>
      </div>
    </Field>
  );
}

function FaqListField({ field, value, disabled, onChange }: { field: FieldDef; value: unknown; disabled: boolean; onChange: (value: unknown) => void }) {
  const items = Array.isArray(value) ? (value as { question?: string; answer?: string }[]) : [];

  return (
    <Field label={field.label} htmlFor={`field-${field.name}`}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-line p-3">
            <input
              aria-label="Question"
              className={inputClass}
              value={item.question ?? ""}
              disabled={disabled}
              placeholder="Question"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], question: event.target.value };
                onChange(next);
              }}
            />
            <textarea
              aria-label="Answer"
              className={inputClass}
              rows={3}
              value={item.answer ?? ""}
              disabled={disabled}
              placeholder="Answer"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], answer: event.target.value };
                onChange(next);
              }}
            />
            <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onChange(items.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => onChange([...items, { question: "", answer: "" }])}>
          Add FAQ
        </Button>
      </div>
    </Field>
  );
}

type ListRowField = {
  key: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

type ListRow = {
  key: number;
  image?: string | null;
  emptyLabel: string;
  onChoose: () => void;
  onRemove: () => void;
  fields: ListRowField[];
};

function ListRowsField({
  field,
  hint,
  disabled,
  rows,
  addLabel,
  onAdd,
}: {
  field: FieldDef;
  hint?: string;
  disabled: boolean;
  rows: ListRow[];
  addLabel: string;
  onAdd: () => void;
}) {
  return (
    <Field label={field.label} htmlFor={`field-${field.name}`} hint={hint}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-wrap items-start gap-3 rounded-xl border border-line p-3">
            {row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.image} alt="" className="size-20 rounded-lg object-cover" />
            ) : (
              <span className="grid size-20 place-items-center rounded-lg bg-mist text-xs text-muted">{row.emptyLabel}</span>
            )}
            <div className="flex-1 space-y-2">
              {row.fields.map((input) => (
                <input
                  key={input.key}
                  aria-label={input.label}
                  className={inputClass}
                  value={input.value}
                  disabled={disabled}
                  placeholder={input.placeholder}
                  onChange={(event) => input.onChange(event.target.value)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={row.onChoose}>
                Choose
              </Button>
              <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={row.onRemove}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </Field>
  );
}

function MediaListField({
  field,
  value,
  disabled,
  onChange,
  onPickGallery,
}: {
  field: FieldDef;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
  onPickGallery: (index: number) => void;
}) {
  const items = Array.isArray(value) ? (value as { asset_id?: string; alt?: string; caption?: string; url?: string }[]) : [];

  return (
    <ListRowsField
      field={field}
      hint="Ordered gallery images."
      disabled={disabled}
      addLabel="Add image"
      onAdd={() => onChange([...items, { asset_id: "", alt: "", caption: "" }])}
      rows={items.map((item, index) => ({
        key: index,
        image: item.url,
        emptyLabel: "No image",
        onChoose: () => onPickGallery(index),
        onRemove: () => onChange(items.filter((_, i) => i !== index)),
        fields: [
          {
            key: "alt",
            label: "Alt text",
            placeholder: "Alt text (required for accessibility)",
            value: item.alt ?? "",
            onChange: (next) => {
              const copy = [...items];
              copy[index] = { ...copy[index], alt: next };
              onChange(copy);
            },
          },
          {
            key: "caption",
            label: "Caption",
            placeholder: "Caption",
            value: item.caption ?? "",
            onChange: (next) => {
              const copy = [...items];
              copy[index] = { ...copy[index], caption: next };
              onChange(copy);
            },
          },
        ],
      }))}
    />
  );
}

type MemberItem = {
  name?: string;
  role?: string;
  avatar_asset_id?: string;
  avatar?: { asset_id?: string; url?: string; alt?: string | null } | null;
};

function MemberListField({
  field,
  value,
  disabled,
  onChange,
  onPickAvatar,
}: {
  field: FieldDef;
  value: unknown;
  disabled: boolean;
  onChange: (value: unknown) => void;
  onPickAvatar: (index: number) => void;
}) {
  const items = Array.isArray(value) ? (value as MemberItem[]) : [];
  const update = (index: number, patch: Partial<MemberItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <ListRowsField
      field={field}
      hint={field.help}
      disabled={disabled}
      addLabel="Add member"
      onAdd={() => onChange([...items, { name: "", role: "", avatar: null }])}
      rows={items.map((item, index) => ({
        key: index,
        image: item.avatar?.url,
        emptyLabel: "No photo",
        onChoose: () => onPickAvatar(index),
        onRemove: () => onChange(items.filter((_, i) => i !== index)),
        fields: [
          {
            key: "name",
            label: "Name",
            placeholder: "Full name",
            value: item.name ?? "",
            onChange: (next) => update(index, { name: next }),
          },
          {
            key: "role",
            label: "Role",
            placeholder: "Role / title",
            value: item.role ?? "",
            onChange: (next) => update(index, { role: next }),
          },
        ],
      }))}
    />
  );
}
