"use client";

import { useId, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { cn } from "@/lib/utils";
import { useMfaConfirm, useMfaDisable, useMfaSetup, usePrincipal } from "@/features/admin/auth/hooks";
import { AdminCard, Field, inputClass, Notice } from "@/features/admin/shared/components/ui";

function Switch({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-forest bg-forest" : "border-line bg-mist",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "block size-4 rounded-full bg-[#ffffff] shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function MfaCard() {
  const { data: principal } = usePrincipal();
  const setup = useMfaSetup();
  const confirm = useMfaConfirm();
  const disable = useMfaDisable();

  const [mode, setMode] = useState<"idle" | "enable" | "disable">("idle");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enabled = principal?.mfa_enabled ?? false;
  const enforced = principal?.mfa_enforced ?? false;
  const codeId = useId();
  const passwordId = useId();

  const cancel = () => {
    setMode("idle");
    setCode("");
    setPassword("");
    setError(null);
    setup.reset();
  };

  const startEnable = () => {
    setError(null);
    setRecoveryCodes(null);
    setMode("enable");
    setup.mutate();
  };

  const submitEnable = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setRecoveryCodes(await confirm.mutateAsync(code));
      setCode("");
      setMode("idle");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Enrolment failed.");
    }
  };

  const submitDisable = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await disable.mutateAsync(password);
      setPassword("");
      setRecoveryCodes(null);
      setMode("idle");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not disable multi-factor authentication.");
    }
  };

  return (
    <AdminCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck aria-hidden className="size-4 text-forest" />
            Multi-factor authentication
          </h2>
          <p className="mt-1 text-sm text-muted">
            {enabled
              ? "Authenticator codes are required when you sign in."
              : "Add an authenticator app as a second factor for your account."}
          </p>
        </div>
        <Switch
          checked={enabled}
          disabled={enforced || disable.isPending || confirm.isPending}
          label={enabled ? "Disable multi-factor authentication" : "Enable multi-factor authentication"}
          onToggle={() => {
            if (enforced) return;
            if (enabled) {
              setError(null);
              setMode("disable");
            } else {
              startEnable();
            }
          }}
        />
      </div>

      {enforced ? (
        <p className="mt-3 text-xs text-muted">Required for all administrators in this workspace.</p>
      ) : null}

      {error ? <Notice tone="warning">{error}</Notice> : null}

      {recoveryCodes ? (
        <div className="mt-4 rounded-xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recovery codes</p>
          <p className="mt-1 text-sm text-muted">Store these somewhere safe. They will not be shown again.</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-ink">
            {recoveryCodes.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === "enable" ? (
        <form onSubmit={submitEnable} className="mt-4 space-y-4 border-t border-line pt-4">
          {setup.isPending && !setup.data ? <p className="text-sm text-muted">Preparing enrolment...</p> : null}

          {setup.data ? (
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Setup key</p>
              <p className="mt-1 break-all font-mono text-sm text-ink">{setup.data.secret}</p>
              <p className="mt-3 text-xs text-muted">Or add this URI where supported:</p>
              <p className="mt-1 break-all font-mono text-xs text-muted">{setup.data.provisioning_uri}</p>
            </div>
          ) : null}

          <Field label="Authenticator code" htmlFor={codeId} required>
            <input
              id={codeId}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={12}
              className={inputClass}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={confirm.isPending || !setup.data}>
              {confirm.isPending ? "Enabling..." : "Confirm and enable"}
            </Button>
            <Button type="button" variant="secondary" onClick={cancel} disabled={confirm.isPending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {mode === "disable" ? (
        <form onSubmit={submitDisable} className="mt-4 space-y-4 border-t border-line pt-4">
          <p className="text-sm text-muted">
            Enter your current password to turn off multi-factor authentication.
          </p>
          <Field label="Current password" htmlFor={passwordId} required>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={disable.isPending || password.length === 0}>
              {disable.isPending ? "Disabling..." : "Disable MFA"}
            </Button>
            <Button type="button" variant="secondary" onClick={cancel} disabled={disable.isPending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </AdminCard>
  );
}
