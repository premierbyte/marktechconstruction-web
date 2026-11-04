export const principalKey = ["admin", "principal"] as const;

export const adminKeys = {
  principal: principalKey,
  enquiries: (filters: Record<string, unknown>) => ["admin", "enquiries", filters] as const,
  enquiry: (id: string) => ["admin", "enquiry", id] as const,
  dashboard: ["admin", "enquiries", "dashboard"] as const,
  owners: ["admin", "enquiries", "owners"] as const,
  media: (filters: Record<string, unknown>) => ["admin", "media", filters] as const,
  users: (filters: Record<string, unknown>) => ["admin", "users", filters] as const,
  roles: ["admin", "roles"] as const,
  notifications: (filters: Record<string, unknown>) => ["admin", "notifications", filters] as const,
  audit: (filters: Record<string, unknown>) => ["admin", "audit", filters] as const,
  resourceList: (resource: string) => ["admin", "resource", resource, "list"] as const,
  resourceEditor: (resource: string, slug: string) => ["admin", "resource", resource, slug] as const,
};
