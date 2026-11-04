"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAudit, type AuditRecord } from "@/features/admin/shared/api";
import { DataTable, type Column } from "@/features/admin/shared/components/DataTable";
import { Badge, SearchInput, Toolbar } from "@/features/admin/shared/components/primitives";
import { PageHeader } from "@/features/admin/shared/components/ui";

export function AuditAdmin() {
  const [resourceType, setResourceType] = useState("");
  const [action, setAction] = useState("");

  const query = useQuery({
    queryKey: ["admin", "audit", { resourceType, action }],
    queryFn: () => listAudit({ resource_type: resourceType, action, per_page: "100" }),
  });

  const columns: Column<AuditRecord>[] = [
    {
      key: "occurred_at",
      header: "Time",
      sortable: true,
      mobile: "primary",
      sortValue: (row) => row.occurred_at ?? "",
      cell: (row) => <span className="whitespace-nowrap text-xs text-muted">{row.occurred_at ? new Date(row.occurred_at).toLocaleString() : "—"}</span>,
    },
    { key: "action", header: "Action", sortable: true, sortValue: (row) => row.action, cell: (row) => <span className="font-semibold text-ink">{row.action}</span> },
    {
      key: "resource",
      header: "Resource",
      mobile: "hidden",
      cell: (row) => (
        <span className="text-muted">
          {row.resource_type}
          {row.resource_id ? <span className="ml-1 font-mono text-xs">{row.resource_id.slice(0, 8)}...</span> : null}
        </span>
      ),
    },
    { key: "actor", header: "Actor", cell: (row) => <span className="text-muted">{row.actor.label ?? "—"}</span> },
    {
      key: "outcome",
      header: "Outcome",
      sortable: true,
      sortValue: (row) => row.outcome,
      cell: (row) => <Badge tone={row.outcome === "failure" ? "danger" : "success"}>{row.outcome}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit history" description="Append-only security and administrative records." />

      <DataTable<AuditRecord>
        rows={query.data?.data ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.isError ? "Audit records could not be loaded." : null}
        onRetry={() => query.refetch()}
        emptyTitle="No audit records"
        toolbar={
          <Toolbar className="gap-2">
            <SearchInput value={action} onChange={setAction} placeholder="Action (e.g. publishing.published)" className="sm:w-64" />
            <SearchInput value={resourceType} onChange={setResourceType} placeholder="Resource type (e.g. enquiry)" className="sm:w-56" />
          </Toolbar>
        }
      />
    </div>
  );
}
