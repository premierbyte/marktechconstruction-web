import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  primary:
    "bg-forest text-white hover:bg-forest-soft focus-visible:outline-clay",
  secondary:
    "border border-forest/25 bg-transparent text-forest hover:border-forest hover:bg-forest/5",
  light: "bg-white text-forest hover:bg-mist",
  ghost: "text-forest hover:bg-forest/5",
} as const;

const sizes = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
} as const;

type Variant = keyof typeof styles;
type Size = keyof typeof sizes;

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    styles[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
