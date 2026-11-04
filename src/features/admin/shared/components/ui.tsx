import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClass =
  "min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-muted/70 aria-[invalid=true]:border-clay";

export const selectClass = inputClass;

export function AdminCard({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag className={cn("rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6", className)}>{children}</Tag>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-3xl text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-clay"> *</span> : null}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className="mb-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs font-medium text-clay">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function StatusBadge({ value, tone }: { value: string; tone?: "neutral" | "clay" | "forest" | "outline" }) {
  const tones = {
    neutral: "bg-mist text-forest",
    clay: "bg-clay/10 text-clay",
    forest: "bg-forest text-white",
    outline: "border border-forest/20 text-forest",
  } as const;

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone ?? "neutral"])}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-clay/40 bg-clay/5 p-4 text-sm leading-6 text-ink">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-2 font-semibold text-forest underline">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm leading-6 text-ink",
        tone === "warning" ? "border-clay/40 bg-clay/5" : "border-forest/20 bg-forest/5",
      )}
    >
      {children}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <p role="status" className="text-sm text-muted">
      {label}…
    </p>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("border-b border-line/60 px-4 py-3 align-top text-ink", className)}>{children}</td>;
}
