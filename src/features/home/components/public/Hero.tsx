"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import type { HeroSlide, SiteSettings } from "@/features/settings";

const AUTOPLAY_MS = 7000;

export function Hero({ settings }: { settings: SiteSettings | null }) {
  const company = settings?.company;
  const contact = settings?.contact;

  const fallback: HeroSlide = {
    eyebrow: contact?.service_area,
    title: company?.tagline || company?.name || "",
    description: company?.description || "",
    primary_label: "Discuss your project",
    primary_href: "/discuss-your-project",
    secondary_label: "View projects",
    secondary_href: "/projects",
    media: null,
  };

  const configured = (settings?.hero?.slides ?? []).filter(
    (slide) => Boolean(slide.title || slide.media?.url),
  );
  const slides = configured.length > 0 ? configured : [fallback];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = setTimeout(
      () => setActive((index) => (index + 1) % slides.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(timer);
  }, [active, paused, reducedMotion, slides.length]);

  const goTo = useCallback(
    (index: number) => {
      setActive(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const slide = slides[active] ?? slides[0];

  return (
    <section
      className="relative isolate overflow-hidden border-b border-line"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="absolute inset-0" aria-hidden>
        {slides.map((item, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === active ? "opacity-100" : "opacity-0",
            )}
          >
            {item.media?.url ? (
              <Image
                src={item.media.url}
                alt={item.media.alt || ""}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest-soft to-clay/70" />
            )}
          </div>
        ))}
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/70 to-ink/85"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(0, 144, 208, 0.45), transparent 55%)",
        }}
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div
          key={active}
          className="hero-fade mx-auto max-w-3xl text-center"
          aria-live="polite"
        >
          {slide.eyebrow ? (
            <Badge
              tone="clay"
              className="bg-clay text-white shadow-lg shadow-clay/30"
            >
              {slide.eyebrow}
            </Badge>
          ) : null}
          <h1 className="display mt-6 text-4xl leading-[1.05] text-balance text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.4)] sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          {slide.description ? (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/85">
              {slide.description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              href={slide.primary_href || "/discuss-your-project"}
              variant="light"
              size="lg"
              className="shadow-lg shadow-ink/30"
            >
              {slide.primary_label || "Discuss your project"}{" "}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            {slide.secondary_label && slide.secondary_href ? (
              <ButtonLink
                href={slide.secondary_href}
                variant="secondary"
                size="lg"
                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white/20"
              >
                {slide.secondary_label}
              </ButtonLink>
            ) : null}
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="flex size-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white hover:bg-white/15"
              aria-label="Previous slide"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    index === active
                      ? "w-8 bg-clay"
                      : "w-2.5 bg-white/40 hover:bg-white/70",
                  )}
                  aria-label={`Go to slide ${index + 1} of ${slides.length}`}
                  aria-current={index === active}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="flex size-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white hover:bg-white/15"
              aria-label="Next slide"
            >
              <ChevronRight aria-hidden className="size-4" />
            </button>
          </div>
        ) : null}
      </Container>
    </section>
  );
}