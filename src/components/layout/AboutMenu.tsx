"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const ABOUT_LINKS = [
  {
    label: "About Marktech",
    href: "/about",
    description: "Who we are, our vision and mission.",
  },
  {
    label: "Our Team",
    href: "/team",
    description: "The people behind our projects.",
  },
  {
    label: "Careers",
    href: "/careers",
    description: "Current opportunities to join the team.",
  },
  {
    label: "Gallery",
    href: "/gallery",
    description: "Photographs from our projects.",
  },
  {
    label: "FAQs",
    href: "/faqs",
    description: "Answers to common questions about working with us.",
  },
] as const;

export function AboutMenu() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const active =
    pathname === "/about" || pathname === "/team" || pathname.startsWith("/careers");

  if (menu.path !== pathname) {
    setMenu({ open: false, path: pathname });
  }

  const open = menu.open;
  const setOpen = (next: boolean) =>
    setMenu((current) => ({ ...current, open: next }));

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Link
        ref={triggerRef}
        href="/about"
        aria-current={pathname === "/about" ? "page" : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(false)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-forest/10 text-forest"
            : "text-ink/75 hover:bg-forest/5 hover:text-forest",
        )}
      >
        About
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </Link>

      <div
        className={cn(
          "absolute left-0 top-full z-50 w-72 pt-3 transition",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-paper/95 p-2 shadow-lift backdrop-blur">
          <ul className="space-y-1">
            {ABOUT_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-forest/5"
                >
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink group-hover:text-forest">
                    {item.label}
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 shrink-0 text-clay opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </span>
                  <span className="text-xs leading-5 text-muted">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
