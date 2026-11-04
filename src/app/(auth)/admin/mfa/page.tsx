"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { MfaChallengePanel, MfaSetupPanel } from "@/features/admin/auth/components/MfaPanels";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { ApiError } from "@/lib/http";

function MfaContent() {
  const router = useRouter();
  const params = useSearchParams();
  const principal = usePrincipal();
  const setup = params.get("setup") === "1";

  useEffect(() => {
    if (principal.isError && principal.error instanceof ApiError && principal.error.isUnauthenticated) {
      router.replace("/admin/login");
    }
  }, [principal.isError, principal.error, router]);

  useEffect(() => {
    if (principal.data?.mfa_verified && !setup) {
      router.replace("/admin");
    }
  }, [principal.data, setup, router]);

  if (principal.isLoading) {
    return <p className="text-sm text-muted">Checking your session…</p>;
  }

  return setup ? <MfaSetupPanel /> : <MfaChallengePanel />;
}

export default function AdminMfaPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <MfaContent />
    </Suspense>
  );
}
