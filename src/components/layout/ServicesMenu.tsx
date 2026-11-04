"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type ServiceLink = {
  slug: string;
  name: string;
  summary?: string | null;
};

export function ServicesMenu({ services }: { services: ServiceLink[] }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const active = pathname === "/services" || pathname.startsWith("/services/");

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
        href="/services"
        aria-current={active ? "page" : undefined}
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
        Services
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </Link>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-[34rem] -translate-x-1/2 pt-3 transition",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-paper/95 shadow-lift backdrop-blur">
          <div className="p-2">
            {services.length > 0 ? (
              <ul className="grid gap-1 sm:grid-cols-2">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="group flex h-full flex-col gap-1 rounded-xl px-3 py-2.5 transition-colors hover:bg-forest/5"
                    >
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink group-hover:text-forest">
                        {service.name}
                        <ArrowUpRight
                          aria-hidden
                          className="size-3.5 shrink-0 text-clay opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </span>
                      {service.summary ? (
                        <span className="line-clamp-2 text-xs leading-5 text-muted">
                          {service.summary}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-4 text-sm text-muted">
                Service details are being updated.
              </p>
            )}
          </div>
          <div className="border-t border-line bg-sand/60 px-4 py-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-semibold text-forest transition-colors hover:text-clay"
            >
              View all services <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}