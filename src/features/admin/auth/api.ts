import { apiFetch } from "@/lib/http";
import type { Principal } from "./types";

export type LoginResult = {
  user: {
    id: string;
    name: string;
    email: string;
    mfa_enabled: boolean;
  };
  mfa_required: boolean;
  mfa_setup_required: boolean;
};

export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await apiFetch<{ data: LoginResult }>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return response.data;
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/v1/auth/logout", { method: "POST" });
}

export async function getPrincipal(): Promise<Principal> {
  const response = await apiFetch<{ data: Principal }>("/api/v1/auth/me");
  return response.data;
}

export async function beginMfaSetup(): Promise<{ secret: string; provisioning_uri: string }> {
  const response = await apiFetch<{ data: { secret: string; provisioning_uri: string } }>("/api/v1/auth/mfa/setup", {
    method: "POST",
  });

  return response.data;
}

export async function confirmMfa(code: string): Promise<string[]> {
  const response = await apiFetch<{ data: { recovery_codes: string[] } }>("/api/v1/auth/mfa/confirm", {
    method: "POST",
    body: { code },
  });

  return response.data.recovery_codes;
}

export async function challengeMfa(code: string): Promise<void> {
  await apiFetch("/api/v1/auth/mfa/challenge", { method: "POST", body: { code } });
}

export async function useRecoveryCode(code: string): Promise<void> {
  await apiFetch("/api/v1/auth/mfa/recovery", { method: "POST", body: { code } });
}

export async function regenerateRecoveryCodes(currentPassword: string): Promise<string[]> {
  const response = await apiFetch<{ data: { recovery_codes: string[] } }>("/api/v1/auth/mfa/recovery-codes", {
    method: "POST",
    body: { current_password: currentPassword },
  });

  return response.data.recovery_codes;
}

export async function disableMfa(currentPassword: string): Promise<void> {
  await apiFetch("/api/v1/auth/mfa/disable", {
    method: "POST",
    body: { current_password: currentPassword },
  });
}

export async function changePassword(currentPassword: string, password: string, confirmation: string): Promise<void> {
  await apiFetch("/api/v1/auth/password", {
    method: "POST",
    body: { current_password: currentPassword, password, password_confirmation: confirmation },
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch("/api/v1/auth/forgot-password", { method: "POST", body: { email }, skipCsrf: false });
}

export async function resetPassword(token: string, email: string, password: string): Promise<void> {
  await apiFetch("/api/v1/auth/reset-password", {
    method: "POST",
    body: { token, email, password, password_confirmation: password },
  });
}
