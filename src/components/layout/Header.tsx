"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, Mail, X, ChevronDown } from "lucide-react";
import { Container } from "./Container";
import { AboutMenu, ABOUT_LINKS } from "./AboutMenu";
import { ServicesMenu, type ServiceLink } from "./ServicesMenu";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_NAVIGATION,
  type SiteSettings,
} from "@/features/settings";

export function Header({
  settings,
  services = [],
}: {
  settings: SiteSettings | null;
  services?: ServiceLink[];
}) {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const dialogRef = useRef<HTMLDialogElement>(null);
  const companyName = settings?.company?.name || "Construction company";
  const logoUrl = settings?.branding?.logo?.url || "/logo.png";
  const navigation =
    settings?.navigation && settings.navigation.length > 0
      ? settings.navigation
      : DEFAULT_NAVIGATION;
  const contact = settings?.contact;

  if (menu.path !== pathname) {
    setMenu({ open: false, path: pathname });
  }

  const open = menu.open;
  const setOpen = (next: boolean) =>
    setMenu((current) => ({ ...current, open: next }));

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const toggleSection = (key: string) =>
    setExpanded((current) => ({ ...current, [key]: !current[key] }));

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/95 backdrop-blur">
      <div className="hidden border-b border-line/60 bg-forest text-white lg:block">
        <Container className="flex h-10 items-center justify-between text-xs">
          <p className="tracking-wide text-white/75">
            {contact?.service_area
              ? `Serving ${contact.service_area}`
              : companyName}
          </p>
          <div className="flex items-center gap-6">
            {contact?.phone ? (
              <a
                className="inline-flex items-center gap-2 hover:text-white"
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
              >
                <Phone aria-hidden className="size-3.5" />
                {contact.phone}
              </a>
            ) : null}
            {contact?.email ? (
              <a
                className="inline-flex items-center gap-2 hover:text-white"
                href={`mailto:${contact.email}`}
              >
                <Mail aria-hidden className="size-3.5" />
                {contact.email}
              </a>
            ) : null}
          </div>
        </Container>
      </div>

      <Container className="flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${companyName} home`}
        >
          <Image
            src={logoUrl}
            alt={`${companyName} logo`}
            width={44}
            height={44}
            priority
            className="size-11 shrink-0 object-contain"
          />
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight text-ink">
              {companyName}
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) =>
            item.href === "/services" ? (
              <ServicesMenu
                key={`${item.href}-${item.label}`}
                services={services}
              />
            ) : item.href === "/about" ? (
              <AboutMenu key={`${item.href}-${item.label}`} />
            ) : (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-forest/10 text-forest"
                    : "text-ink/75 hover:bg-forest/5 hover:text-forest",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink
            href="/discuss-your-project"
            className="hidden sm:inline-flex"
          >
            Discuss your project
          </ButtonLink>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-forest/20 text-forest lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </Container>

      <dialog
        id="mobile-navigation"
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-sm lg:hidden"
      >
        <div className="flex h-full justify-end">
          <div
            className={cn(
              "flex h-full w-[88%] max-w-sm flex-col bg-paper shadow-lift",
              open && "drawer-enter",
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex min-w-0 items-center gap-3"
                aria-label={`${companyName} home`}
              >
                <Image
                  src={logoUrl}
                  alt={`${companyName} logo`}
                  width={36}
                  height={36}
                  className="size-9 shrink-0 object-contain"
                />
                <span className="truncate text-sm font-bold text-ink">
                  {companyName}
                </span>
              </Link>
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-forest/5 text-forest transition-colors hover:bg-forest/10"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>

            <nav
              aria-label="Mobile primary"
              className="flex-1 overflow-y-auto px-4 py-5"
            >
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Menu
              </p>
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const hasChildren =
                    item.href === "/services" || item.href === "/about";
                  const sectionOpen = expanded[item.href] ?? false;

                  if (!hasChildren) {
                    return (
                      <li key={`${item.href}-${item.label}`}>
                        <Link
                          href={item.href}
                          aria-current={
                            isActive(item.href) ? "page" : undefined
                          }
                          className={cn(
                            "flex min-h-12 items-center rounded-xl px-4 text-lg font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-forest text-white shadow-sm"
                              : "text-ink hover:bg-forest/5 hover:text-forest",
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={`${item.href}-${item.label}`}>
                      <button
                        type="button"
                        onClick={() => toggleSection(item.href)}
                        aria-expanded={sectionOpen}
                        className={cn(
                          "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-4 text-lg font-medium transition-colors",
                          isActive(item.href)
                            ? "bg-forest text-white shadow-sm"
                            : "text-ink hover:bg-forest/5 hover:text-forest",
                        )}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "size-4 transition-transform duration-300",
                            sectionOpen && "rotate-180",
                          )}
                        />
                      </button>

                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300 ease-out",
                          sectionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="overflow-hidden">
                          <ul className="mt-1 space-y-0.5 pb-2 pl-2">
                            {item.href === "/about"
                              ? ABOUT_LINKS.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      href={link.href}
                                      onClick={() => setOpen(false)}
                                      aria-current={
                                        isActive(link.href) ? "page" : undefined
                                      }
                                      className={cn(
                                        "flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors",
                                        isActive(link.href)
                                          ? "bg-forest/10 font-semibold text-forest"
                                          : "text-muted hover:bg-forest/5 hover:text-forest",
                                      )}
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))
                              : [
                                  { label: "All services", slug: "" },
                                  ...services.map((service) => ({
                                    label: service.name,
                                    slug: service.slug,
                                  })),
                                ].map((service) => (
                                  <li key={service.slug || "all"}>
                                    <Link
                                      href={
                                        service.slug
                                          ? `/services/${service.slug}`
                                          : "/services"
                                      }
                                      onClick={() => setOpen(false)}
                                      className="flex min-h-10 items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-forest/5 hover:text-forest"
                                    >
                                      {service.label}
                                    </Link>
                                  </li>
                                ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 space-y-3 border-t border-line pt-6">
                <ButtonLink
                  href="/discuss-your-project"
                  className="w-full"
                  size="lg"
                  onClick={() => setOpen(false)}
                >
                  Discuss your project
                </ButtonLink>
                {contact?.phone ? (
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-forest"
                  >
                    <Phone aria-hidden className="size-4" /> {contact.phone}
                  </a>
                ) : null}
              </div>
            </nav>
          </div>
        </div>
      </dialog>
    </header>
  );
}
