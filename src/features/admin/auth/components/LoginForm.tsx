"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/http";
import { Field, inputClass, Notice } from "@/features/admin/shared/components/ui";
import { useLogin } from "../hooks";

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const result = await login.mutateAsync({ email, password });

      if (result.mfa_required) {
        router.push("/admin/mfa");
      } else if (result.mfa_setup_required) {
        router.push("/admin/mfa?setup=1");
      } else {
        router.push("/admin");
      }
    } catch (caught) {
      if (caught instanceof ApiError && caught.isValidation) {
        setError("The email address or password is incorrect.");
      } else {
        setError(caught instanceof Error ? caught.message : "Sign in failed.");
      }
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Administration</p>
        <h1 className="display mt-2 text-3xl text-ink">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Administrative access requires a completed second factor.
        </p>
      </div>

      {error ? <Notice tone="warning">{error}</Notice> : null}

      <Field label="Email address" htmlFor="login-email" required>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          className={inputClass}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>

      <Field label="Password" htmlFor="login-password" required>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Signing in…" : "Sign in"}
      </Button>

      <div className="flex flex-wrap justify-between gap-2 text-xs">
        <Link className="font-semibold text-forest underline" href="/admin/recovery">
          Use a recovery code
        </Link>
        <Link className="font-semibold text-forest underline" href="/admin/reset-password">
          Forgot password
        </Link>
      </div>
    </form>
  );
}
