import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Principal } from "./types";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type PrincipalResult =
  | { kind: "ok"; principal: Principal }
  | { kind: "unauthenticated" }
  | { kind: "mfa_setup_required" }
  | { kind: "mfa_required" }
  | { kind: "error" };

export async function fetchPrincipalServer(): Promise<PrincipalResult> {
  const cookieHeader = (await cookies()).toString();

  try {
    const response = await fetch(`${INTERNAL_API_URL}/api/v1/auth/me`, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        Origin: SITE_URL,
        Referer: `${SITE_URL}/admin`,
      },
      cache: "no-store",
    });

    if (response.status === 401) return { kind: "unauthenticated" };

    const body = (await response.json().catch(() => null)) as
      | { data?: Principal; code?: string }
      | null;

    if (response.status === 403) {
      return body?.code === "mfa_setup_required" ? { kind: "mfa_setup_required" } : { kind: "mfa_required" };
    }

    if (!response.ok || !body?.data) return { kind: "error" };

    return { kind: "ok", principal: body.data };
  } catch {
    return { kind: "error" };
  }
}

export async function requirePrincipal(): Promise<Principal> {
  const result = await fetchPrincipalServer();

  if (result.kind === "ok") return result.principal;
  if (result.kind === "mfa_setup_required") redirect("/admin/mfa?setup=1");
  if (result.kind === "mfa_required") redirect("/admin/mfa");
  redirect("/admin/login");
}
