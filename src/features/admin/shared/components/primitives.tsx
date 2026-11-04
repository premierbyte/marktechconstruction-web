"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "outline";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-mist text-forest",
  success: "bg-forest text-white",
  warning: "bg-clay/15 text-clay",
  danger: "bg-clay/15 text-clay",
  info: "bg-forest/10 text-forest",
  outline: "border border-forest/20 text-forest",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function stateTone(state: string): Tone {
  if (state === "published") return "success";
  if (state === "archived") return "danger";
  if (state === "approved" || state === "in_review") return "outline";
  return "neutral";
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{value}</p>
        </div>
        <span className={cn("grid size-10 place-items-center rounded-xl", toneClasses[tone])}>
          <Icon aria-hidden className="size-5" />
        </span>
      </div>
      {hint ? <p className="mt-3 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      {Icon ? (
        <span className="grid size-12 place-items-center rounded-2xl bg-mist text-forest">
          <Icon aria-hidden className="size-6" />
        </span>
      ) : null}
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-mist", className)} aria-hidden />;
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2 rounded-2xl border border-line bg-white p-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton key={columnIndex} className="h-5" />
          ))}
        </div>
      ))}
    </div>
  );
}

type IconButtonProps = {
  label: string;
  icon: LucideIcon;
  variant?: "ghost" | "outline" | "danger";
  size?: "sm" | "md";
} & ButtonHTMLAttributes<HTMLButtonElement>;

const iconButtonVariants = {
  ghost: "text-forest hover:bg-forest/5",
  outline: "border border-forest/20 text-forest hover:bg-forest/5",
  danger: "text-clay hover:bg-clay/10",
} as const;

export function IconButton({ label, icon: Icon, variant = "ghost", size = "md", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "size-8" : "size-10",
        iconButtonVariants[variant],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden className={size === "sm" ? "size-4" : "size-5"} />
    </button>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 aria-[invalid=true]:border-clay"
      />
    </div>
  );
}

const subscribeNoop = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !ref.current) return;

      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      const target = ref.current?.querySelector<HTMLElement>(
        '[data-autofocus], input, textarea, button:not([disabled])',
      );
      target?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      window.clearTimeout(timer);
      previouslyFocused.current?.focus();
    };
  }, [open]);

  return ref;
}

const modalSizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof modalSizes;
}) {
  const mounted = useIsMounted();
  const ref = useDialog(open, onClose);
  const titleId = useId();

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="fixed inset-0 cursor-default bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl",
          "max-h-[92vh] overflow-y-auto",
          modalSizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          <IconButton label="Close" icon={X} onClick={onClose} />
        </div>
        {children ? <div className="p-5 sm:p-6">{children}</div> : null}
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-line p-5 sm:p-6">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  pending,
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  pending?: boolean;
  tone?: "danger" | "primary";
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            data-autofocus
            variant={tone === "danger" ? "light" : "primary"}
            className={tone === "danger" ? "bg-clay text-white hover:bg-clay-soft" : undefined}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? "Working..." : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-clay/10 text-clay">
          <AlertTriangle aria-hidden className="size-5" />
        </span>
        <p className="text-sm leading-6 text-muted">{description ?? "This action cannot be undone."}</p>
      </div>
    </Modal>
  );
}

function paginationItems(current: number, lastPage: number): (number | "ellipsis")[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const anchors = new Set<number>([1, lastPage, current, current - 1, current + 1]);
  const pages = [...anchors]
    .filter((value) => value >= 1 && value <= lastPage)
    .sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  let previous = 0;

  for (const value of pages) {
    if (previous !== 0 && value - previous > 1) {
      items.push("ellipsis");
    }
    items.push(value);
    previous = value;
  }

  return items;
}

export function Pagination({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
}: {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) {
    return (
      <div className="flex items-center justify-between px-1 py-2 text-xs text-muted">
        <span>
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>
    );
  }

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const items = paginationItems(page, lastPage);
  const navButton =
    "inline-grid size-9 place-items-center rounded-lg border border-line text-forest transition-colors hover:bg-forest/5 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-1 py-2 sm:flex-row">
      <p className="text-xs text-muted">
        Showing <span className="font-semibold text-ink">{from}</span>–
        <span className="font-semibold text-ink">{to}</span> of{" "}
        <span className="font-semibold text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={navButton}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} aria-hidden className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-grid h-9 min-w-9 place-items-center rounded-lg border px-2.5 text-xs font-semibold transition-colors",
                item === page
                  ? "border-forest bg-forest text-white"
                  : "border-line text-ink hover:bg-forest/5",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          aria-label="Next page"
          className={navButton}
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>{children}</div>;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex rounded-lg border border-line bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
            value === option.value ? "bg-forest text-white" : "text-ink/70 hover:bg-forest/5",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-clay">{children}</p>;
}
