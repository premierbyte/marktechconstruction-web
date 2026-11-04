import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RichText } from "./RichText";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "clay" | "forest" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-mist text-forest",
    clay: "bg-clay/10 text-clay",
    forest: "bg-forest text-white",
    outline: "border border-forest/20 text-forest",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <h2 className="display text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Prose({ text, className }: { text?: string | null; className?: string }) {
  return <RichText value={text} className={cn("max-w-3xl leading-8", className)} />;
}
