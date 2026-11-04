import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export { Container } from "./Container";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold uppercase tracking-[0.22em] text-clay", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  action,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  intro?: string | null;
  align?: "left" | "center";
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        action && "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <Heading className="display text-3xl leading-[1.1] text-balance text-ink sm:text-4xl lg:text-5xl">
          {title}
        </Heading>
        {intro ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Section({
  children,
  className,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "sand" | "forest" | "white";
}) {
  const tones = {
    paper: "bg-paper text-ink",
    sand: "bg-sand text-ink",
    forest: "bg-forest text-white",
    white: "bg-white text-ink",
  } as const;

  return <section className={cn("py-16 sm:py-20 lg:py-24", tones[tone], className)}>{children}</section>;
}
