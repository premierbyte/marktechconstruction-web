"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { hasPermission } from "@/features/admin/auth/types";
import { Inbox } from "lucide-react";
import {
  addEnquiryNote,
  assignEnquiry,
  createEnquiryExport,
  deleteEnquiry,
  enquiryAttachmentUrl,
  enquiryExportUrl,
  getEnquiry,
  listEnquiries,
  listOwners,
  markEnquiryContacted,
  updateEnquiryStatus,
  type EnquiryListItem,
} from "@/features/admin/shared/api";
import { AdminCard, ErrorBanner, Field, inputClass, PageHeader, Notice, Spinner, StatusBadge } from "@/features/admin/shared/components/ui";
import { Badge, ConfirmDialog, Pagination } from "@/features/admin/shared/components/primitives";
import { DataTable, type Column } from "@/features/admin/shared/components/DataTable";

const STATUSES = ["new", "under_review", "awaiting_client", "qualified", "proposal_sent", "won", "lost", "closed", "spam"];
const TERMINAL = ["lost", "closed", "spam"];

export function EnquiriesList() {
  const { data: principal } = usePrincipal();
  const canExport = hasPermission(principal ?? null, "enquiries.export");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [exportId, setExportId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin", "enquiries", filters],
    queryFn: () => listEnquiries(filters),
  });

  const exportMutation = useMutation({
    mutationFn: () => createEnquiryExport(filters),
    onSuccess: (data) => setExportId(data.id),
  });

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  const setFilter = (patch: Record<string, string>) =>
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? "1" }));

  const columns: Column<EnquiryListItem>[] = [
    {
      key: "reference",
      header: "Reference",
      sortable: true,
      mobile: "primary",
      sortValue: (row) => row.reference,
      cell: (row) => (
        <>
          <span className="font-mono text-xs font-semibold text-ink">{row.reference}</span>
          <span className="block text-xs text-muted">{row.type}</span>
        </>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      sortable: true,
      sortValue: (row) => row.contact_name,
      cell: (row) => (
        <>
          <span className="font-semibold text-ink">{row.contact_name}</span>
          <span className="block text-xs text-muted">{row.service_label ?? row.organization ?? "—"}</span>
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => <Badge tone={TERMINAL.includes(row.status) ? "danger" : "neutral"}>{row.status.replace(/_/g, " ")}</Badge>,
    },
    { key: "owner", header: "Owner", sortable: true, sortValue: (row) => row.owner.label ?? "", cell: (row) => <span className="text-muted">{row.owner.label ?? "Unassigned"}</span> },
    { key: "follow_up", header: "Follow-up", mobile: "hidden", sortable: true, sortValue: (row) => row.next_follow_up_on ?? "", cell: (row) => <span className="text-muted">{row.next_follow_up_on ?? "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Filter, assign and follow up enquiries. Officers see records assigned to them."
        actions={
          canExport ? (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
                {exportMutation.isPending ? "Preparing export..." : "Export CSV"}
              </Button>
              {exportId ? (
                <a className="text-sm font-semibold text-forest underline" href={enquiryExportUrl(exportId)}>
                  Download
                </a>
              ) : null}
            </div>
          ) : null
        }
      />

      <AdminCard>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Status" htmlFor="filter-status">
            <select id="filter-status" className={inputClass} value={filters.status ?? ""} onChange={(event) => setFilter({ status: event.target.value })}>
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type" htmlFor="filter-type">
            <select id="filter-type" className={inputClass} value={filters.type ?? ""} onChange={(event) => setFilter({ type: event.target.value })}>
              <option value="">All types</option>
              <option value="project">Project</option>
              <option value="general">General</option>
            </select>
          </Field>
          <Field label="Search" htmlFor="filter-search">
            <input id="filter-search" className={inputClass} value={filters.search ?? ""} onChange={(event) => setFilter({ search: event.target.value })} placeholder="Reference, name, brief" />
          </Field>
          <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-ink">
            <input type="checkbox" checked={filters.unassigned === "1"} onChange={(event) => setFilter({ unassigned: event.target.checked ? "1" : "" })} />
            Unassigned only
          </label>
        </div>
      </AdminCard>

      <DataTable<EnquiryListItem>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        paginate={false}
        loading={query.isLoading}
        error={query.isError ? "Enquiries could not be loaded." : null}
        onRetry={() => query.refetch()}
        emptyIcon={Inbox}
        emptyTitle="No enquiries match these filters"
        emptyDescription="Try clearing the status, type or search filters."
        actions={(row) => (
          <Link className="font-semibold text-forest underline" href={`/admin/enquiries/${row.id}`}>
            Open
          </Link>
        )}
      />

      {meta ? (
        <Pagination
          page={meta.current_page}
          lastPage={meta.last_page}
          total={meta.total}
          perPage={meta.per_page}
          onPageChange={(next) => setFilters((current) => ({ ...current, page: String(next) }))}
        />
      ) : null}
    </div>
  );
}

export function EnquiryDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: principal } = usePrincipal();
  const canManage = hasPermission(principal ?? null, "enquiries.manage");
  const canDelete = (principal?.roles ?? []).includes("administrator");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [targetStatus, setTargetStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = useQuery({ queryKey: ["admin", "enquiry", id], queryFn: () => getEnquiry(id) });
  const owners = useQuery({ queryKey: ["admin", "enquiries", "owners"], queryFn: listOwners });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "enquiry", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
  };

  const assign = useMutation({
    mutationFn: (ownerId: string | null) => assignEnquiry(id, ownerId),
    onSuccess: () => {
      setMessage("Owner updated.");
      invalidate();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Assignment failed."),
  });

  const status = useMutation({
    mutationFn: () =>
      updateEnquiryStatus(id, {
        status: targetStatus,
        expected_status: query.data?.status,
        reason: reason || undefined,
        next_follow_up_on: followUp || undefined,
      }),
    onSuccess: () => {
      setMessage("Status updated.");
      setReason("");
      setTargetStatus("");
      invalidate();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Status change failed."),
  });

  const contacted = useMutation({
    mutationFn: () => markEnquiryContacted(id, { note: note || undefined, next_follow_up_on: followUp || undefined }),
    onSuccess: () => {
      setMessage("Contact recorded.");
      setNote("");
      invalidate();
    },
  });

  const addNote = useMutation({
    mutationFn: () => addEnquiryNote(id, note),
    onSuccess: () => {
      setMessage("Note added.");
      setNote("");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteEnquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      router.push("/admin/enquiries");
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Delete failed."),
  });

  if (query.isLoading) return <Spinner label="Loading enquiry" />;
  if (query.isError || !query.data) {
    return <ErrorBanner message="This enquiry could not be loaded, or you do not have access to it." onRetry={() => query.refetch()} />;
  }

  const enquiry = query.data;
  const requiresReason = TERMINAL.includes(targetStatus);

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-6">
        <Link className="text-xs font-semibold uppercase tracking-wide text-muted hover:text-forest" href="/admin/enquiries">
          ← Enquiries
        </Link>
        <h1 className="display mt-2 text-3xl text-ink">{enquiry.contact_name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span className="font-mono">{enquiry.reference}</span>
          <StatusBadge value={enquiry.status} tone={TERMINAL.includes(enquiry.status) ? "clay" : "neutral"} />
          <span>{enquiry.type}</span>
        </div>
      </div>

      {message ? <Notice>{message}</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard>
          <h2 className="text-sm font-semibold text-ink">Brief</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Email" value={enquiry.email} />
            <Detail label="Phone" value={enquiry.phone} />
            <Detail label="Preferred contact" value={enquiry.preferred_contact} />
            <Detail label="Organization" value={enquiry.organization} />
            <Detail label="Service" value={enquiry.service_label} />
            <Detail label="Sector" value={enquiry.sector_label} />
            <Detail label="Location" value={enquiry.project_location} />
            <Detail label="Budget band" value={enquiry.budget_band} />
            <Detail label="Start period" value={enquiry.start_period} />
          </dl>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ink">Description</h3>
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted">{enquiry.brief}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink">Attachments</h3>
            {enquiry.attachments.length === 0 ? (
              <p className="mt-1 text-sm text-muted">No attachments.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {enquiry.attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between gap-3">
                    <span className="truncate text-ink">{attachment.original_name}</span>
                    {attachment.scan_status === "clean" ? (
                      <a className="font-semibold text-forest underline" href={enquiryAttachmentUrl(id, attachment.media_asset_id)}>
                        Download
                      </a>
                    ) : (
                      <StatusBadge value={attachment.scan_status} tone="clay" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AdminCard>

        <div className="space-y-6">
          {canManage ? (
            <AdminCard>
              <h2 className="text-sm font-semibold text-ink">Ownership</h2>
              <Field label="Assigned owner" htmlFor="enquiry-owner">
                <select
                  id="enquiry-owner"
                  className={inputClass}
                  value={enquiry.owner.id ?? ""}
                  disabled={assign.isPending}
                  onChange={(event) => assign.mutate(event.target.value || null)}
                >
                  <option value="">Unassigned</option>
                  {(owners.data ?? []).map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.label}
                    </option>
                  ))}
                </select>
              </Field>
            </AdminCard>
          ) : null}

          {canManage ? (
            <AdminCard>
              <h2 className="text-sm font-semibold text-ink">Update</h2>
              <div className="mt-3 space-y-4">
                <Field label="New status" htmlFor="enquiry-status">
                  <select id="enquiry-status" className={inputClass} value={targetStatus} onChange={(event) => setTargetStatus(event.target.value)}>
                    <option value="">Choose a status</option>
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {value.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </Field>
                {requiresReason ? (
                  <Field label="Reason" htmlFor="enquiry-reason" required>
                    <input id="enquiry-reason" className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)} />
                  </Field>
                ) : null}
                <Field label="Next follow-up" htmlFor="enquiry-follow-up">
                  <input id="enquiry-follow-up" type="date" className={inputClass} value={followUp} onChange={(event) => setFollowUp(event.target.value)} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled={!targetStatus || status.isPending} onClick={() => status.mutate()}>
                    Update status
                  </Button>
                  <Button type="button" size="sm" variant="secondary" disabled={contacted.isPending} onClick={() => contacted.mutate()}>
                    Record contact
                  </Button>
                </div>
              </div>
            </AdminCard>
          ) : null}

          {canManage ? (
            <AdminCard>
              <h2 className="text-sm font-semibold text-ink">Internal note</h2>
              <div className="mt-3 space-y-3">
                <textarea aria-label="Note" rows={3} className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} />
                <Button type="button" size="sm" variant="secondary" disabled={note.trim().length < 2 || addNote.isPending} onClick={() => addNote.mutate()}>
                  Add note
                </Button>
                <p className="text-xs text-muted">Notes are internal and never sent to the visitor.</p>
              </div>
            </AdminCard>
          ) : null}

          {canDelete ? (
            <AdminCard>
              <h2 className="text-sm font-semibold text-ink">Delete enquiry</h2>
              <p className="mt-1 text-sm text-muted">
                Permanently remove this enquiry, its activity history and private attachments. This cannot be undone.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3 bg-clay text-white hover:bg-clay-soft"
                disabled={remove.isPending}
                onClick={() => setConfirmDelete(true)}
              >
                Delete enquiry
              </Button>
            </AdminCard>
          ) : null}
        </div>
      </div>

      <AdminCard>
        <h2 className="text-sm font-semibold text-ink">Activity</h2>
        <ol className="mt-3 space-y-3 text-sm">
          {enquiry.activities.map((activity) => (
            <li key={activity.id} className="border-l-2 border-line pl-3">
              <p className="font-semibold text-ink">
                {activity.action.replace(/_/g, " ")}
                {activity.to_status ? ` → ${activity.to_status.replace(/_/g, " ")}` : ""}
              </p>
              <p className="text-xs text-muted">
                {activity.actor.label ?? "System"} · {activity.occurred_at ? new Date(activity.occurred_at).toLocaleString() : ""}
              </p>
              {activity.reason ? <p className="text-sm text-ink">Reason: {activity.reason}</p> : null}
              {activity.note ? <p className="text-sm text-muted">{activity.note}</p> : null}
            </li>
          ))}
        </ol>
      </AdminCard>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Delete enquiry"
        description="This permanently removes the enquiry, its activity history and private attachments. This cannot be undone."
        confirmLabel="Delete enquiry"
        pending={remove.isPending}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-ink">{value ?? "—"}</dd>
    </div>
  );
}
