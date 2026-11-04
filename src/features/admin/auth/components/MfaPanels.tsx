"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { Field, inputClass, Notice } from "@/features/admin/shared/components/ui";
import { useMfaChallenge, useMfaConfirm, useMfaSetup, useRecoveryLogin } from "../hooks";

function CodeInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return (
    <input
      id={id}
      inputMode="numeric"
      autoComplete="one-time-code"
      className={inputClass}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      maxLength={12}
      required
    />
  );
}

export function MfaChallengePanel() {
  const router = useRouter();
  const challenge = useMfaChallenge();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await challenge.mutateAsync(code);
      router.push("/admin");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Verification failed.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Step 2 of 2</p>
        <h1 className="display mt-2 text-3xl text-ink">Enter your authentication code</h1>
      </div>

      {error ? <Notice tone="warning">{error}</Notice> : null}

      <Field label="Authenticator code" htmlFor="mfa-code" required>
        <CodeInput id="mfa-code" value={code} onChange={setCode} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={challenge.isPending}>
        Verify and continue
      </Button>
      <p className="text-xs">
        <Link className="font-semibold text-forest underline" href="/admin/recovery">
          Use a recovery code instead
        </Link>
      </p>
    </form>
  );
}

export function MfaSetupPanel() {
  const router = useRouter();
  const setup = useMfaSetup();
  const confirm = useMfaConfirm();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    if (setup.status === "idle") setup.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setRecoveryCodes(await confirm.mutateAsync(code));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Enrolment failed.");
    }
  };

  if (recoveryCodes) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Recovery codes</p>
          <h1 className="display mt-2 text-3xl text-ink">Store these somewhere safe</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Each code can be used once if you lose access to your authenticator. They will not be shown again.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-white p-4 font-mono text-sm">
          {recoveryCodes.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
        <Button type="button" size="lg" className="w-full" onClick={() => router.push("/admin")}>
          Continue to the workspace
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Set up MFA</p>
        <h1 className="display mt-2 text-3xl text-ink">Add a second factor</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Add the secret below to your authenticator app, then enter the generated code.
        </p>
      </div>

      {error ? <Notice tone="warning">{error}</Notice> : null}

      {setup.isPending && !setup.data ? <p className="text-sm text-muted">Preparing enrolment…</p> : null}

      {setup.data ? (
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Setup key</p>
          <p className="mt-1 break-all font-mono text-sm text-ink">{setup.data.secret}</p>
          <p className="mt-3 text-xs text-muted">Or add this URI where supported:</p>
          <p className="mt-1 break-all font-mono text-xs text-muted">{setup.data.provisioning_uri}</p>
        </div>
      ) : null}

      <Field label="Authenticator code" htmlFor="mfa-confirm-code" required>
        <CodeInput id="mfa-confirm-code" value={code} onChange={setCode} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={confirm.isPending || !setup.data}>
        Confirm and enable
      </Button>
    </form>
  );
}

export function RecoveryLoginPanel() {
  const router = useRouter();
  const recovery = useRecoveryLogin();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await recovery.mutateAsync(code);
      router.push("/admin");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Recovery sign in failed.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Recovery</p>
        <h1 className="display mt-2 text-3xl text-ink">Use a recovery code</h1>
      </div>

      {error ? <Notice tone="warning">{error}</Notice> : null}

      <Field label="Recovery code" htmlFor="recovery-code" required>
        <input
          id="recovery-code"
          className={inputClass}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={recovery.isPending}>
        Continue
      </Button>
      <p className="text-xs">
        <Link className="font-semibold text-forest underline" href="/admin/login">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
