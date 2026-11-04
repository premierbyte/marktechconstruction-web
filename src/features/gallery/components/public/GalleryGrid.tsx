"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";
import type { GalleryImage } from "../../types";

function GalleryCard({
  image,
  eager,
  onOpen,
}: {
  image: GalleryImage;
  eager: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const label = image.caption || image.alt;

  return (
    <button
      type="button"
      aria-label={label ? `Preview: ${label}` : "Preview image"}
      onClick={(event) => onOpen(event.currentTarget)}
      className="group relative block w-full overflow-hidden rounded-2xl border border-line bg-mist text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
    >
      <span className="block aspect-[4/3] overflow-hidden">
        {image.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={label || ""}
            width={image.width ?? undefined}
            height={image.height ?? undefined}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center bg-sand text-muted">
            <ImageOff aria-hidden className="size-8" />
          </span>
        )}
      </span>

      <span className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        <Expand aria-hidden className="size-4" />
      </span>

      {label ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 block bg-gradient-to-t from-ink/85 via-ink/25 to-transparent p-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="block text-sm font-semibold text-white">{label}</span>
          {image.credit ? (
            <span className="mt-1 block text-xs text-white/60">
              Photo: {image.credit}
            </span>
          ) : null}
        </span>
      ) : null}
    </button>
  );
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setActive(null);
    triggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (direction: number) => {
      setActive((current) =>
        current === null
          ? current
          : (current + direction + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, close, step]);

  const current = active === null ? null : images[active];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <GalleryCard
            key={image.id}
            image={image}
            eager={index < 3}
            onOpen={(trigger) => {
              triggerRef.current = trigger;
              setActive(index);
            }}
          />
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close preview"
              className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X aria-hidden className="size-5" />
            </button>

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink/60 text-white hover:bg-ink/80 sm:-left-16"
                >
                  <ChevronLeft aria-hidden className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink/60 text-white hover:bg-ink/80 sm:-right-16"
                >
                  <ChevronRight aria-hidden className="size-6" />
                </button>
              </>
            ) : null}

            {current.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt={current.alt || current.caption || ""}
                className="mx-auto max-h-[78vh] w-auto rounded-2xl object-contain shadow-lift"
              />
            ) : null}

            <div className="mt-3 text-center">
              {current.caption || current.alt ? (
                <p className="text-sm font-semibold text-white">
                  {current.caption || current.alt}
                </p>
              ) : null}
              {current.credit ? (
                <p className="mt-1 text-xs text-white/60">
                  Photo: {current.credit}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-white/50">
                {active! + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}