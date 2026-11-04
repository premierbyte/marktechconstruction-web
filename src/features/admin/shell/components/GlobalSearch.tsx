"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAnyPermission, type Principal } from "@/features/admin/auth/types";
import { ADMIN_NAV, NAV_GROUPS, type AdminNavItem } from "@/features/admin/shell/nav";

type SearchEntry = {
  id: string;
  label: string;
  hint: string;
  group: string;
  icon: AdminNavItem["icon"];
  href: string;
  external?: boolean;
};

export function GlobalSearch({ principal }: { principal: Principal }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<SearchEntry[]>(() => {
    const nav = ADMIN_NAV.filter(
      (item) => item.permissions.length === 0 || hasAnyPermission(principal, item.permissions),
    ).map((item) => ({
      id: `nav:${item.href}`,
      label: item.label,
      hint: item.group,
      group: item.group,
      icon: item.icon,
      href: item.href,
    }));

    const quick: SearchEntry[] = [
      { id: "quick:public", label: "View public website", hint: "Opens in a new tab", group: "Quick links", icon: ExternalLink, href: "/", external: true },
    ];

    return [...nav, ...quick];
  }, [principal]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term === "") return entries;
    return entries.filter((entry) => entry.label.toLowerCase().includes(term) || entry.hint.toLowerCase().includes(term));
  }, [entries, query]);

  const grouped = useMemo(() => {
    const order = [...NAV_GROUPS, "Quick links"] as string[];
    const map = new Map<string, SearchEntry[]>();
    for (const entry of results) {
      const list = map.get(entry.group) ?? [];
      list.push(entry);
      map.set(entry.group, list);
    }
    return order.filter((group) => map.has(group)).map((group) => ({ group, items: map.get(group) ?? [] }));
  }, [results]);

  const openSearch = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          openSearch();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const activeIndex = results.length > 0 ? Math.min(active, results.length - 1) : 0;

  const select = (entry: SearchEntry) => {
    setOpen(false);
    if (entry.external) {
      window.open(entry.href, "_blank", "noopener");
      return;
    }
    router.push(entry.href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[activeIndex];
      if (entry) select(entry);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  let flatIndex = -1;

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm text-muted transition-colors hover:border-forest/30 hover:text-ink"
      >
        <Search aria-hidden className="size-4" />
        <span className="hidden sm:inline">Search or jump to…</span>
        <kbd className="ml-2 hidden items-center gap-0.5 rounded border border-line bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:inline-flex">
          <Command aria-hidden className="size-3" />K
        </kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
          <button type="button" aria-label="Close search" tabIndex={-1} className="fixed inset-0 cursor-default bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="Global search" className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search aria-hidden className="size-5 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search pages, records and settings"
                aria-label="Search"
                className="h-14 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
              />
              <kbd className="rounded border border-line bg-mist px-1.5 py-0.5 text-[10px] font-semibold text-muted">ESC</kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {grouped.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">No matches for “{query}”.</p>
              ) : (
                grouped.map(({ group, items }) => (
                  <div key={group} className="py-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{group}</p>
                    <ul>
                      {items.map((entry) => {
                        flatIndex += 1;
                        const index = flatIndex;
                        const Icon = entry.icon;
                        return (
                          <li key={entry.id}>
                            <button
                              type="button"
                              onMouseEnter={() => setActive(index)}
                              onClick={() => select(entry)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
                                activeIndex === index ? "bg-forest text-white" : "text-ink hover:bg-forest/5",
                              )}
                            >
                              <Icon aria-hidden className={cn("size-4", activeIndex === index ? "text-white" : "text-muted")} />
                              <span className="flex-1 font-medium">{entry.label}</span>
                              <span className={cn("text-xs", activeIndex === index ? "text-white/70" : "text-muted")}>{entry.hint}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
