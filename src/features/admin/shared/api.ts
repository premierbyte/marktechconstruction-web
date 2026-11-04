import { apiFetch, ApiError } from "@/lib/http";
import type { AdminUser, Principal, RoleSummary } from "@/features/admin/auth/types";

export type EditorState = {
  document_id: string | null;
  type: string;
  slug?: string;
  current_version: number;
  published: boolean;
  archived: boolean;
  state: string;
  revision_id: string | null;
  payload: Record<string, unknown> | null;
};

export type RevisionSummary = {
  id: string;
  version: number;
  state: string;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  created_at: string | null;
};

export type MediaAsset = {
  id: string;
  visibility: "public" | "private";
  kind: "image" | "document";
  url: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  scan_status: string;
  claimed: boolean;
  created_at: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta?: { current_page: number; per_page: number; total: number; last_page: number };
  links?: unknown;
};

export type EnquiryListItem = {
  id: string;
  reference: string;
  type: "project" | "general" | string;
  status: string;
  owner: { id: string | null; label: string | null };
  contact_name: string;
  organization: string | null;
  service_label: string | null;
  project_location: string | null;
  last_contacted_at: string | null;
  next_follow_up_on: string | null;
  created_at: string | null;
};

export type EnquiryDetail = EnquiryListItem & {
  email: string | null;
  phone: string | null;
  preferred_contact: string;
  subject: string | null;
  sector_label: string | null;
  brief: string;
  budget_band: string | null;
  start_period: string | null;
  privacy_version: string;
  proposal_sent_on: string | null;
  proposal_reference: string | null;
  source_page: string | null;
  attachments: { id: string; media_asset_id: string; original_name: string; scan_status: string }[];
  activities: {
    id: string;
    action: string;
    actor: { id: string | null; label: string | null };
    from_status: string | null;
    to_status: string | null;
    note: string | null;
    reason: string | null;
    occurred_at: string | null;
  }[];
};

export type EnquiryDashboard = {
  totals: {
    all: number;
    by_status: Record<string, number>;
    unassigned: number;
    overdue_follow_ups: number;
    notification_failures: number;
  };
  owner_workload: { owner_id: string; owner_label: string; total: number }[];
};

function asData<T>(response: { data: T }): T {
  return response.data;
}

/* ------------------------------ resources ------------------------------ */

export async function listResource<T = Record<string, unknown>>(api: string): Promise<T[]> {
  return asData(await apiFetch<{ data: T[] }>(api));
}

export async function getEditor(api: string, slug: string): Promise<EditorState> {
  return getEditorAt(`${api}/${encodeURIComponent(slug)}`);
}

export async function getEditorAt(url: string): Promise<EditorState> {
  return asData(await apiFetch<{ data: EditorState }>(url));
}

export async function saveDraft(
  api: string,
  slug: string,
  payload: Record<string, unknown>,
  expectedVersion: number,
): Promise<EditorState> {
  return saveDraftAt(`${api}/${encodeURIComponent(slug)}`, payload, expectedVersion);
}

export async function saveDraftAt(
  url: string,
  payload: Record<string, unknown>,
  expectedVersion: number,
): Promise<EditorState> {
  return asData(
    await apiFetch<{ data: EditorState }>(url, {
      method: "PUT",
      body: { ...payload, expected_version: expectedVersion },
    }),
  );
}

export async function runWorkflow(
  api: string,
  slug: string,
  action: "submit-review" | "approve" | "publish" | "schedule" | "archive" | "restore",
  body?: Record<string, unknown>,
): Promise<{ revision_id?: string }> {
  return runWorkflowAt(`${api}/${encodeURIComponent(slug)}`, action, body);
}

export async function runWorkflowAt(
  resourceUrl: string,
  action: "submit-review" | "approve" | "publish" | "schedule" | "archive" | "restore",
  body?: Record<string, unknown>,
): Promise<{ revision_id?: string }> {
  const isCancel = action === "schedule" && body?.cancel === true;
  const method: "POST" | "DELETE" = isCancel ? "DELETE" : "POST";
  const path = isCancel ? `${resourceUrl}/schedule` : `${resourceUrl}/${action}`;

  const response = await apiFetch<{ data?: { revision_id?: string } }>(path, { method, body: body ?? {} });

  return response.data ?? {};
}

export async function listRevisions(api: string, slug: string): Promise<RevisionSummary[]> {
  return listRevisionsAt(`${api}/${encodeURIComponent(slug)}`);
}

export async function listRevisionsAt(resourceUrl: string): Promise<RevisionSummary[]> {
  return asData(await apiFetch<{ data: RevisionSummary[] }>(`${resourceUrl}/revisions`));
}

export async function deleteResource(api: string, slug: string): Promise<void> {
  await apiFetch<void>(`${api}/${encodeURIComponent(slug)}`, { method: "DELETE" });
}

export async function getScheduledPublications(): Promise<
  { id: string; document_id: string; revision_id: string; run_at: string; timezone: string }[]
> {
  return asData(await apiFetch<{ data: { id: string; document_id: string; revision_id: string; run_at: string; timezone: string }[] }>("/api/v1/admin/publishing/scheduled"));
}

/* -------------------------------- media -------------------------------- */

export async function listMedia(filters: Record<string, string> = {}): Promise<Paginated<MediaAsset>> {
  const query = new URLSearchParams(filters).toString();
  return apiFetch<Paginated<MediaAsset>>(`/api/v1/admin/media${query ? `?${query}` : ""}`);
}

export async function uploadMedia(form: FormData): Promise<MediaAsset> {
  return asData(await apiFetch<{ data: MediaAsset }>("/api/v1/admin/media", { method: "POST", body: form }));
}

export async function updateMedia(id: string, body: Record<string, unknown>): Promise<MediaAsset> {
  return asData(await apiFetch<{ data: MediaAsset }>(`/api/v1/admin/media/${id}`, { method: "PUT", body }));
}

export async function deleteMedia(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/admin/media/${id}`, { method: "DELETE" });
}

/* ------------------------------ enquiries ------------------------------ */

export async function listEnquiries(
  filters: Record<string, string>,
): Promise<Paginated<EnquiryListItem>> {
  const query = new URLSearchParams(filters).toString();
  return apiFetch<Paginated<EnquiryListItem>>(`/api/v1/admin/enquiries${query ? `?${query}` : ""}`);
}

export async function getEnquiry(id: string): Promise<EnquiryDetail> {
  return asData(await apiFetch<{ data: EnquiryDetail }>(`/api/v1/admin/enquiries/${id}`));
}

export async function deleteEnquiry(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/admin/enquiries/${id}`, { method: "DELETE" });
}

export async function getEnquiryDashboard(): Promise<EnquiryDashboard> {
  return asData(await apiFetch<{ data: EnquiryDashboard }>("/api/v1/admin/enquiries/dashboard"));
}

export async function listOwners(): Promise<{ id: string; label: string; email: string }[]> {
  return asData(await apiFetch<{ data: { id: string; label: string; email: string }[] }>("/api/v1/admin/enquiries/owners"));
}

export async function assignEnquiry(id: string, ownerId: string | null): Promise<EnquiryDetail> {
  return asData(await apiFetch<{ data: EnquiryDetail }>(`/api/v1/admin/enquiries/${id}/assign`, { method: "POST", body: { owner_id: ownerId } }));
}

export async function updateEnquiryStatus(id: string, body: Record<string, unknown>): Promise<EnquiryDetail> {
  return asData(await apiFetch<{ data: EnquiryDetail }>(`/api/v1/admin/enquiries/${id}/status`, { method: "POST", body }));
}

export async function addEnquiryNote(id: string, note: string): Promise<void> {
  await apiFetch(`/api/v1/admin/enquiries/${id}/notes`, { method: "POST", body: { note } });
}

export async function markEnquiryContacted(id: string, body: Record<string, unknown>): Promise<EnquiryDetail> {
  return asData(await apiFetch<{ data: EnquiryDetail }>(`/api/v1/admin/enquiries/${id}/contacted`, { method: "POST", body }));
}

export async function createEnquiryExport(filters: Record<string, unknown>): Promise<{ id: string; status: string }> {
  return asData(await apiFetch<{ data: { id: string; status: string } }>("/api/v1/admin/enquiries/export", { method: "POST", body: filters }));
}

export function enquiryAttachmentUrl(enquiryId: string, assetId: string): string {
  return `/api/v1/admin/enquiries/${enquiryId}/attachments/${assetId}/download`;
}

export function enquiryExportUrl(exportId: string): string {
  return `/api/v1/admin/enquiries/exports/${exportId}/download`;
}

/* -------------------------------- users -------------------------------- */

export async function listUsers(filters: Record<string, string> = {}): Promise<Paginated<AdminUser>> {
  const query = new URLSearchParams(filters).toString();
  return apiFetch<Paginated<AdminUser>>(`/api/v1/admin/users${query ? `?${query}` : ""}`);
}

export async function listRoles(): Promise<RoleSummary[]> {
  return asData(await apiFetch<{ data: RoleSummary[] }>("/api/v1/admin/roles"));
}

export async function createUser(body: Record<string, unknown>): Promise<{ user: AdminUser; temporaryPassword: string }> {
  const response = await apiFetch<{ data: AdminUser; meta: { temporary_password: string } }>("/api/v1/admin/users", {
    method: "POST",
    body,
  });

  return { user: response.data, temporaryPassword: response.meta.temporary_password };
}

export async function setUserActive(id: string, active: boolean): Promise<AdminUser> {
  return asData(await apiFetch<{ data: AdminUser }>(`/api/v1/admin/users/${id}/active`, { method: "PUT", body: { is_active: active } }));
}

export async function updateUser(id: string, body: Record<string, unknown>): Promise<AdminUser> {
  return asData(await apiFetch<{ data: AdminUser }>(`/api/v1/admin/users/${id}`, { method: "PUT", body }));
}

export async function revokeUserSessions(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/admin/users/${id}/revoke-sessions`, { method: "POST" });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/admin/users/${id}`, { method: "DELETE" });
}

/* ---------------------------- notifications ---------------------------- */

export type Delivery = {
  id: string;
  purpose: string;
  recipient: string;
  recipient_type: string;
  subject_type: string | null;
  subject_id: string | null;
  status: string;
  attempts: number;
  last_error: string | null;
  read?: boolean;
  sent_at: string | null;
  created_at: string | null;
};

export type NotificationAttempt = {
  id: string;
  attempt: number;
  status: string;
  error: string | null;
  provider_message_id: string | null;
  occurred_at: string | null;
};

export type DeliveryDetail = Delivery & {
  channel: string;
  payload: Record<string, unknown> | null;
  available_at: string | null;
  attempt_history: NotificationAttempt[];
};

export type NotificationFeed = {
  deliveries: Delivery[];
  unread: number;
  failed: number;
};

export async function listNotifications(filters: Record<string, string> = {}): Promise<Paginated<Delivery>> {
  const query = new URLSearchParams(filters).toString();
  return apiFetch<Paginated<Delivery>>(`/api/v1/admin/notifications${query ? `?${query}` : ""}`);
}

export async function getNotificationFeed(): Promise<NotificationFeed> {
  const response = await apiFetch<{ data: Delivery[]; meta?: { unread?: number; failed?: number } }>(
    "/api/v1/admin/notifications/feed",
  );

  return {
    deliveries: response.data ?? [],
    unread: response.meta?.unread ?? 0,
    failed: response.meta?.failed ?? 0,
  };
}

export async function getNotification(id: string): Promise<DeliveryDetail> {
  return asData(await apiFetch<{ data: DeliveryDetail }>(`/api/v1/admin/notifications/${id}`));
}

export async function markNotificationRead(id: string): Promise<Delivery> {
  return asData(await apiFetch<{ data: Delivery }>(`/api/v1/admin/notifications/${id}/read`, { method: "POST" }));
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/api/v1/admin/notifications/read-all", { method: "POST" });
}

export async function resendNotification(id: string): Promise<Delivery> {
  return asData(await apiFetch<{ data: Delivery }>(`/api/v1/admin/notifications/${id}/resend`, { method: "POST" }));
}

/* -------------------------------- support ------------------------------- */

export type KnowledgeEntry = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
};

export async function listKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  return asData(await apiFetch<{ data: KnowledgeEntry[] }>("/api/v1/admin/support/entries"));
}

export async function createKnowledgeEntry(body: Record<string, unknown>): Promise<KnowledgeEntry> {
  return asData(await apiFetch<{ data: KnowledgeEntry }>("/api/v1/admin/support/entries", { method: "POST", body }));
}

export async function updateKnowledgeEntry(id: string, body: Record<string, unknown>): Promise<KnowledgeEntry> {
  return asData(
    await apiFetch<{ data: KnowledgeEntry }>(`/api/v1/admin/support/entries/${id}`, { method: "PUT", body }),
  );
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/admin/support/entries/${id}`, { method: "DELETE" });
}

/* -------------------------------- audit -------------------------------- */

export type AuditRecord = {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  outcome: string;
  actor: { id: string | null; label: string | null };
  context: Record<string, unknown>;
  occurred_at: string | null;
};

export async function listAudit(filters: Record<string, string> = {}): Promise<Paginated<AuditRecord>> {
  const query = new URLSearchParams(filters).toString();
  return apiFetch<Paginated<AuditRecord>>(`/api/v1/admin/audit${query ? `?${query}` : ""}`);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
