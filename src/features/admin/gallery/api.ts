import { apiFetch } from "@/lib/http";

export type AdminGalleryImage = {
  id: string;
  url: string | null;
  original_name: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  created_at: string | null;
};

export type AdminGalleryPage = {
  data: AdminGalleryImage[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  filters?: { years: number[] };
};

export async function listGallery(
  filters: Record<string, string> = {},
): Promise<AdminGalleryPage> {
  const query = new URLSearchParams(filters).toString();

  return apiFetch<AdminGalleryPage>(
    `/api/v1/admin/gallery${query ? `?${query}` : ""}`,
  );
}

export async function uploadGallery(
  form: FormData,
): Promise<AdminGalleryImage> {
  const response = await apiFetch<{ data: AdminGalleryImage }>(
    "/api/v1/admin/gallery",
    { method: "POST", body: form },
  );

  return response.data;
}

export async function updateGallery(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminGalleryImage> {
  const response = await apiFetch<{ data: AdminGalleryImage }>(
    `/api/v1/admin/gallery/${id}`,
    { method: "PUT", body },
  );

  return response.data;
}

export async function deleteGallery(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/admin/gallery/${id}`, { method: "DELETE" });
}