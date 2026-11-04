"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { changePassword, regenerateRecoveryCodes } from "@/features/admin/auth/api";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { AdminCard, Field, inputClass, Notice, PageHeader } from "@/features/admin/shared/components/ui";
import { MfaCard } from "./MfaCard";

const MIN_PASSWORD_LENGTH = 8;

export function AccountPanel() {
  const { data: principal } = usePrincipal();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const newTooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;
  const sameAsCurrent = next.length > 0 && next === current;
  const passwordsMismatch = confirmation.length > 0 && next !== confirmation;
  const canSubmit =
    current.length > 0 &&
    next.length >= MIN_PASSWORD_LENGTH &&
    next === confirmation &&
    !sameAsCurrent;

  const change = useMutation({
    mutationFn: () => changePassword(current, next, confirmation),
    onSuccess: () => {
      setPasswordMessage("Password updated. Other sessions were signed out.");
      setCurrent("");
      setNext("");
      setConfirmation("");
    },
    onError: (error) => setPasswordMessage(error instanceof Error ? error.message : "Password change failed."),
  });

  const regenerate = useMutation({
    mutationFn: () => regenerateRecoveryCodes(current),
    onSuccess: (codes) => {
      setRecoveryCodes(codes);
      setRecoveryError(null);
    },
    onError: (error) => setRecoveryError(error instanceof Error ? error.message : "Could not regenerate recovery codes."),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description={principal ? `Signed in as ${principal.email}` : "Manage your credentials."} />

      <AdminCard>
        <h2 className="text-sm font-semibold text-ink">Change password</h2>
        {passwordMessage ? <Notice>{passwordMessage}</Notice> : null}
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field label="Current password" htmlFor="account-current" required>
            <input id="account-current" type="password" autoComplete="current-password" className={inputClass} value={current} onChange={(event) => setCurrent(event.target.value)} />
          </Field>
          <Field label="New password" htmlFor="account-new" required hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
            <input
              id="account-new"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              minLength={MIN_PASSWORD_LENGTH}
              value={next}
              onChange={(event) => setNext(event.target.value)}
              aria-invalid={sameAsCurrent || newTooShort}
              aria-describedby={sameAsCurrent ? "account-new-error" : newTooShort ? "account-new-length" : undefined}
            />
            {sameAsCurrent ? (
              <p id="account-new-error" className="mt-1.5 text-xs font-medium text-clay">
                The new password must be different from your current password.
              </p>
            ) : newTooShort ? (
              <p id="account-new-length" className="mt-1.5 text-xs font-medium text-clay">
                Use at least {MIN_PASSWORD_LENGTH} characters.
              </p>
            ) : null}
          </Field>
          <Field label="Confirm password" htmlFor="account-confirm" required>
            <input
              id="account-confirm"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              aria-invalid={passwordsMismatch}
              aria-describedby={passwordsMismatch ? "account-confirm-error" : undefined}
            />
            {passwordsMismatch ? (
              <p id="account-confirm-error" className="mt-1.5 text-xs font-medium text-clay">
                The passwords do not match.
              </p>
            ) : null}
          </Field>
        </div>
        <Button
          type="button"
          className="mt-4"
          disabled={!canSubmit || change.isPending}
          onClick={() => change.mutate()}
        >
          Update password
        </Button>
      </AdminCard>

      <MfaCard />

      {principal?.mfa_enabled ? (
        <AdminCard>
          <h2 className="text-sm font-semibold text-ink">Recovery codes</h2>
          <p className="mt-1 text-sm text-muted">Regenerating replaces all existing recovery codes. Enter your current password to confirm.</p>
          {recoveryError ? <Notice tone="warning">{recoveryError}</Notice> : null}
          <Button type="button" variant="secondary" className="mt-3" disabled={!current || regenerate.isPending} onClick={() => regenerate.mutate()}>
            Regenerate recovery codes
          </Button>
          {recoveryCodes ? (
            <ul className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-line p-4 font-mono text-sm">
              {recoveryCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          ) : null}
        </AdminCard>
      ) : null}
    </div>
  );
}
