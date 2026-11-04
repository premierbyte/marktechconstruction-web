"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Send } from "lucide-react";
import {
  getNotification,
  listNotifications,
  markNotificationRead,
  resendNotification,
  type Delivery,
} from "@/features/admin/shared/api";
import { DataTable, type Column } from "@/features/admin/shared/components/DataTable";
import { Badge, IconButton, Modal } from "@/features/admin/shared/components/primitives";
import { inputClass, PageHeader } from "@/features/admin/shared/components/ui";

const PURPOSES = [
  { value: "", label: "All purposes" },
  { value: "enquiry_receipt", label: "Enquiry receipt" },
  { value: "staff_enquiry_notice", label: "Staff enquiry notice" },
];

function statusTone(status: string) {
  if (status === "failed") return "danger" as const;
  if (status === "sent") return "success" as const;
  if (status === "processing") return "info" as const;
  return "neutral" as const;
}

function NotificationDetail({ id, onResend }: { id: string; onResend: (id: string) => void }) {
  const detail = useQuery({ queryKey: ["admin", "notification", id], queryFn: () => getNotification(id) });

  if (detail.isLoading) {
    return (
      <p role="status" className="text-sm text-muted">
        Loading delivery...
      </p>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <p role="alert" className="text-sm text-clay">
        This delivery could not be loaded.
      </p>
    );
  }

  const delivery = detail.data;

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Recipient</dt>
          <dd className="mt-0.5 break-words text-ink">{delivery.recipient}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Status</dt>
          <dd className="mt-0.5">
            <Badge tone={statusTone(delivery.status)}>{delivery.status}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Subject</dt>
          <dd className="mt-0.5 break-words text-ink">
            {delivery.subject_type ?? "—"}
            {delivery.subject_id ? ` · ${delivery.subject_id}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Attempts</dt>
          <dd className="mt-0.5 text-ink">{delivery.attempts}</dd>
        </div>
      </dl>

      {delivery.last_error ? (
        <div className="rounded-xl border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <p className="text-xs font-semibold uppercase tracking-wide text-clay">Last error</p>
          <p className="mt-1 break-words">{delivery.last_error}</p>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Attempt history</p>
        {delivery.attempt_history.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {delivery.attempt_history.map((attempt) => (
              <li
                key={attempt.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Attempt {attempt.attempt}</p>
                  {attempt.error ? <p className="mt-0.5 break-words text-xs text-muted">{attempt.error}</p> : null}
                </div>
                <Badge tone={attempt.status === "failed" ? "danger" : "success"}>{attempt.status}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No delivery attempts recorded yet.</p>
        )}
      </div>

      {delivery.payload ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Payload</p>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-line bg-sand/50 p-3 text-xs leading-5 text-ink">
            {JSON.stringify(delivery.payload, null, 2)}
          </pre>
        </div>
      ) : null}

      <div className="flex justify-end">
        <IconButton label="Resend" icon={Send} variant="outline" onClick={() => onResend(delivery.id)} />
      </div>
    </div>
  );
}

export function NotificationsAdmin() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = { status, purpose, per_page: "100" };
  const query = useQuery({
    queryKey: ["admin", "notifications", filters],
    queryFn: () => listNotifications(filters),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "notification"] });
  };

  const resend = useMutation({ mutationFn: resendNotification, onSuccess: invalidate });
  const read = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });

  const openDetail = (id: string) => {
    setSelectedId(id);
    read.mutate(id);
  };

  const columns: Column<Delivery>[] = [
    {
      key: "purpose",
      header: "Purpose",
      sortable: true,
      mobile: "primary",
      sortValue: (row) => row.purpose,
      cell: (row) => (
        <span className="font-semibold capitalize text-ink">{row.purpose.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "recipient",
      header: "Recipient",
      sortable: true,
      sortValue: (row) => row.recipient,
      cell: (row) => <span className="text-muted">{row.recipient}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge>,
    },
    {
      key: "attempts",
      header: "Attempts",
      align: "right",
      sortable: true,
      sortValue: (row) => row.attempts,
      cell: (row) => <span className="text-muted">{row.attempts}</span>,
    },
    {
      key: "last_error",
      header: "Last error",
      mobile: "hidden",
      cell: (row) => <span className="text-xs text-muted">{row.last_error ?? "—"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Delivery attempts, failures and controlled resend."
      />

      <DataTable<Delivery>
        rows={query.data?.data ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.isError ? "Notifications could not be loaded." : null}
        onRetry={() => query.refetch()}
        emptyTitle="No notifications"
        emptyDescription="Delivery requests appear here once an enquiry notification is queued."
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted">
              Status
              <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              Purpose
              <select className={inputClass} value={purpose} onChange={(event) => setPurpose(event.target.value)}>
                {PURPOSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <IconButton label="View delivery" icon={Eye} size="sm" onClick={() => openDetail(row.id)} />
            <IconButton
              label="Resend"
              icon={Send}
              size="sm"
              disabled={resend.isPending}
              onClick={() => resend.mutate(row.id)}
            />
          </div>
        )}
      />

      <Modal
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title="Delivery detail"
        description="Attempt history and payload for this delivery."
        size="lg"
      >
        {selectedId ? <NotificationDetail id={selectedId} onResend={(id) => resend.mutate(id)} /> : null}
      </Modal>
    </div>
  );
}
