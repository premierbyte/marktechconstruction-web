"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BellRing, Clock, Inbox, UserPlus } from "lucide-react";
import { getEnquiryDashboard, getScheduledPublications } from "@/features/admin/shared/api";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { hasAnyPermission } from "@/features/admin/auth/types";
import { AdminCard, ErrorBanner, PageHeader, Spinner } from "@/features/admin/shared/components/ui";
import { Badge, EmptyState, StatCard } from "@/features/admin/shared/components/primitives";

function LinkedStat({
  href,
  label,
  value,
  icon,
  tone,
}: {
  href?: string;
  label: string;
  value: number | string;
  icon: Parameters<typeof StatCard>[0]["icon"];
  tone?: Parameters<typeof StatCard>[0]["tone"];
}) {
  const card = <StatCard label={label} value={value} icon={icon} tone={tone} />;

  return href ? (
    <Link href={href} className="block rounded-2xl transition-shadow hover:shadow-md">
      {card}
    </Link>
  ) : (
    card
  );
}

export function Dashboard() {
  const { data: principal } = usePrincipal();
  const canSeeEnquiries = hasAnyPermission(principal ?? null, ["enquiries.view_all", "enquiries.view_assigned"]);
  const canPublish = hasAnyPermission(principal ?? null, ["content.publish"]);

  const enquiries = useQuery({ queryKey: ["admin", "enquiries", "dashboard"], queryFn: getEnquiryDashboard, enabled: canSeeEnquiries });
  const scheduled = useQuery({ queryKey: ["admin", "publishing", "scheduled"], queryFn: getScheduledPublications, enabled: canPublish });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${principal?.name?.split(" ")[0] ?? "there"}`}
        description="An overview of the work awaiting attention. Counts respect your access scope."
      />

      {canSeeEnquiries ? (
        <section aria-labelledby="enquiry-overview" className="space-y-4">
          <h2 id="enquiry-overview" className="text-sm font-semibold uppercase tracking-wide text-muted">
            Enquiries
          </h2>

          {enquiries.isLoading ? <Spinner label="Loading enquiry summary" /> : null}
          {enquiries.isError ? <ErrorBanner message="The enquiry summary could not be loaded." onRetry={() => enquiries.refetch()} /> : null}

          {enquiries.data ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <LinkedStat href="/admin/enquiries" label="Total" value={enquiries.data.totals.all} icon={Inbox} tone="info" />
                <LinkedStat href="/admin/enquiries?unassigned=1" label="Unassigned" value={enquiries.data.totals.unassigned} icon={UserPlus} tone="warning" />
                <LinkedStat href="/admin/enquiries" label="Overdue follow-ups" value={enquiries.data.totals.overdue_follow_ups} icon={Clock} tone="warning" />
                <LinkedStat label="Notification failures" value={enquiries.data.totals.notification_failures} icon={BellRing} tone="danger" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <AdminCard>
                  <h3 className="text-sm font-semibold text-ink">By status</h3>
                  {Object.keys(enquiries.data.totals.by_status).length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No enquiries yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {Object.entries(enquiries.data.totals.by_status).map(([status, total]) => (
                        <li key={status} className="flex items-center justify-between">
                          <Badge>{status.replace(/_/g, " ")}</Badge>
                          <span className="font-semibold text-ink">{total}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminCard>

                <AdminCard>
                  <h3 className="text-sm font-semibold text-ink">Owner workload</h3>
                  {enquiries.data.owner_workload.length === 0 ? (
                    <p className="mt-3 text-sm text-muted">No assigned enquiries.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {enquiries.data.owner_workload.map((owner) => (
                        <li key={owner.owner_id} className="flex items-center justify-between">
                          <span className="text-ink">{owner.owner_label}</span>
                          <span className="font-semibold text-ink">{owner.total}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminCard>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {canPublish ? (
        <section aria-labelledby="publishing-overview" className="space-y-4">
          <h2 id="publishing-overview" className="text-sm font-semibold uppercase tracking-wide text-muted">
            Scheduled publications
          </h2>
          {scheduled.isLoading ? <Spinner label="Loading schedule" /> : null}
          {scheduled.data ? (
            scheduled.data.length === 0 ? (
              <EmptyState icon={Clock} title="Nothing is scheduled" description="Scheduled publications will appear here." />
            ) : (
              <AdminCard>
                <ul className="divide-y divide-line text-sm">
                  {scheduled.data.map((action) => (
                    <li key={action.id} className="flex items-center justify-between py-2">
                      <span className="font-mono text-xs text-muted">{action.document_id}</span>
                      <span className="text-ink">
                        {new Date(action.run_at).toLocaleString()} ({action.timezone})
                      </span>
                    </li>
                  ))}
                </ul>
              </AdminCard>
            )
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
