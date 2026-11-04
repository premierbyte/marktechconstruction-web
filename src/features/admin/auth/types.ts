export type Principal = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  mfa_enabled: boolean;
  mfa_verified: boolean;
  mfa_enforced: boolean;
  roles: string[];
  permissions: string[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  mfa_enabled: boolean;
  last_login_at: string | null;
  roles: string[];
  created_at: string | null;
};

export type RoleSummary = {
  id: string;
  name: string;
  label: string;
  permissions: string[];
  users_count?: number;
};

export function hasPermission(principal: Principal | null, permission: string): boolean {
  return principal?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(principal: Principal | null, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(principal, permission));
}
