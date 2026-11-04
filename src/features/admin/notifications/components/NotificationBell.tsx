"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotificationFeed,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/admin/shared/api";
import { Badge } from "@/features/admin/shared/components/primitives";

const FEED_KEY = ["admin", "notifications", "feed"] as const;

function timeAgo(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;

  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const feed = useQuery({
    queryKey: FEED_KEY,
    queryFn: getNotificationFeed,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });

  const markRead = useMutation({ mutationFn: markNotificationRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const unread = feed.data?.unread ?? 0;
  const failed = feed.data?.failed ?? 0;
  const deliveries = feed.data?.deliveries ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-grid size-10 place-items-center rounded-full border border-line bg-white text-forest hover:border-forest/30"
      >
        <Bell aria-hidden className="size-4" />
        {unread > 0 ? (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-white",
              failed > 0 ? "bg-clay" : "bg-forest",
            )}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-40 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-white shadow-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="truncate text-xs text-muted">
                {unread} unread{failed > 0 ? ` · ${failed} failed` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending || unread === 0}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-forest hover:bg-forest/5 disabled:opacity-40"
            >
              <CheckCheck aria-hidden className="size-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {feed.isLoading ? (
              <p role="status" className="px-4 py-6 text-sm text-muted">
                Loading notifications...
              </p>
            ) : null}

            {feed.isError ? (
              <p role="alert" className="px-4 py-6 text-sm text-clay">
                Notifications could not be loaded.
              </p>
            ) : null}

            {!feed.isLoading && !feed.isError && deliveries.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>
            ) : null}

            {deliveries.map((delivery) => (
              <Link
                key={delivery.id}
                href="/admin/notifications"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  if (!delivery.read) markRead.mutate(delivery.id);
                }}
                className={cn(
                  "block border-b border-line/60 px-4 py-3 transition-colors hover:bg-forest/5",
                  !delivery.read && "bg-forest/[0.03]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold capitalize text-ink">
                    {delivery.purpose.replace(/_/g, " ")}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">{timeAgo(delivery.created_at)}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">{delivery.recipient}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge
                    tone={
                      delivery.status === "failed"
                        ? "danger"
                        : delivery.status === "sent"
                          ? "success"
                          : "neutral"
                    }
                  >
                    {delivery.status}
                  </Badge>
                  {delivery.status === "failed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-clay">
                      <TriangleAlert aria-hidden className="size-3" /> Needs attention
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-3 text-center text-sm font-semibold text-forest hover:bg-forest/5"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
