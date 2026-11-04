"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { Field, inputClass, Notice } from "@/features/admin/shared/components/ui";
import { resetPassword } from "../api";

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    try {
      await resetPassword(token, email, password);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Reset failed.");
    }
  };

  if (done) {
    return (
      <div className="space-y-5">
        <h1 className="display text-3xl text-ink">Password reset</h1>
        <p className="text-sm leading-6 text-muted">Your password has been changed. Sign in with your new password.</p>
        <Link className="font-semibold text-forest underline" href="/admin/login">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="display text-3xl text-ink">Choose a new password</h1>

      {error ? <Notice tone="warning">{error}</Notice> : null}

      <input type="hidden" value={email} readOnly />

      <Field label="New password" htmlFor="reset-password" required>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>

      <Field label="Confirm password" htmlFor="reset-confirm" required>
        <input
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full">
        Reset password
      </Button>
    </form>
  );
}
