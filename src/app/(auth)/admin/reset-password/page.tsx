"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/admin/auth/components/ResetPasswordForm";
import { Notice } from "@/features/admin/shared/components/ui";

function ResetContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  if (!token || !email) {
    return (
      <div className="space-y-4">
        <h1 className="display text-3xl text-ink">Reset link incomplete</h1>
        <Notice tone="warning">This password reset link is missing information or has expired.</Notice>
        <Link className="font-semibold text-forest underline" href="/admin/login">
          Back to sign in
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} email={email} />;
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <ResetContent />
    </Suspense>
  );
}
