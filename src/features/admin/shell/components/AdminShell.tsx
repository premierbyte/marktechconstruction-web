"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LogOut, Menu, UserCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout, usePrincipal } from "@/features/admin/auth/hooks";
import { hasAnyPermission, hasPermission, type Principal } from "@/features/admin/auth/types";
import { ADMIN_NAV, NAV_GROUPS, type AdminNavItem } from "@/features/admin/shell/nav";
import { GlobalSearch } from "@/features/admin/shell/components/GlobalSearch";
import { ThemeToggle } from "@/features/admin/shell/components/ThemeToggle";
import { NotificationBell } from "@/features/admin/notifications";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label="Administration" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) return null;

        return (
          <div key={group}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{group}</p>
            <ul className="space-y-0.5">
              {groupItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active ? "bg-forest text-white" : "text-ink/80 hover:bg-forest/5",
                      )}
                    >
                      <Icon aria-hidden className={cn("size-4 shrink-0", active ? "text-white" : "text-muted")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function UserCard({
  principal,
  onSignOut,
  pending,
}: {
  principal: Principal;
  onSignOut: () => void;
  pending: boolean;
}) {
  return (
    <div className="shrink-0 border-t border-line p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest text-xs font-bold text-white">
          {initials(principal.name) || "A"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{principal.name}</p>
          <p className="truncate text-xs text-muted">{principal.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={pending}
        className="mt-2 inline-flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-forest hover:bg-forest/5 disabled:opacity-60"
      >
        <LogOut aria-hidden className="size-4" /> Sign out
      </button>
    </div>
  );
}

export function AdminShell({ initialPrincipal, children }: { initialPrincipal: Principal; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: principal } = usePrincipal();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const current = principal ?? initialPrincipal;

  const items = useMemo(
    () => ADMIN_NAV.filter((item) => item.permissions.length === 0 || hasAnyPermission(current, item.permissions)),
    [current],
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = () => setUserMenuOpen(false);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [userMenuOpen]);

  const signOut = async () => {
    await logout.mutateAsync();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-sand">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-line bg-paper lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
          <Image
            src="/logo.png"
            alt="Marktech logo"
            width={28}
            height={28}
            className="size-7 shrink-0 object-contain"
          />
          <span className="font-bold text-ink">Admin workspace</span>
        </div>
        <NavLinks items={items} pathname={pathname} />
        <UserCard principal={current} onSignOut={signOut} pending={logout.isPending} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-paper shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <span className="flex items-center gap-2 font-bold text-ink">
                <Image
                  src="/logo.png"
                  alt="Marktech logo"
                  width={24}
                  height={24}
                  className="size-6 shrink-0 object-contain"
                />{" "}
                Admin
              </span>
              <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-lg text-forest hover:bg-forest/5">
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <UserCard principal={current} onSignOut={signOut} pending={logout.isPending} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-grid size-10 place-items-center rounded-lg border border-forest/20 text-forest lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu aria-hidden className="size-5" />
            </button>
            <div className="min-w-0">
              <GlobalSearch principal={current} />
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <span className="hidden text-xs text-muted lg:block">{current.roles.join(", ") || "No role assigned"}</span>
            {hasPermission(current, "notifications.manage") ? <NotificationBell /> : null}
            <ThemeToggle />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setUserMenuOpen((value) => !value);
              }}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 hover:border-forest/30"
            >
              <span className="grid size-8 place-items-center rounded-full bg-forest text-xs font-bold text-white">
                {initials(current.name) || "A"}
              </span>
              <ChevronDown aria-hidden className="size-4 text-muted" />
            </button>

            {userMenuOpen ? (
              <div role="menu" className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-xl border border-line bg-white shadow-xl">
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink">{current.name}</p>
                  <p className="truncate text-xs text-muted">{current.email}</p>
                </div>
                <Link
                  href="/admin/account"
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-forest/5"
                >
                  <UserCircle aria-hidden className="size-4 text-muted" /> Account settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  disabled={logout.isPending}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-forest hover:bg-forest/5 disabled:opacity-60"
                >
                  <LogOut aria-hidden className="size-4" /> Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {current.must_change_password ? (
          <div className="border-b border-clay/40 bg-clay/5 px-4 py-3 text-sm text-ink lg:px-8">
            You are using a temporary password.{" "}
            <Link className="font-semibold text-forest underline" href="/admin/account">
              Change it now
            </Link>
            .
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
