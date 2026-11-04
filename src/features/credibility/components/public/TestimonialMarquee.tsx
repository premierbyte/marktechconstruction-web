"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import type { Testimonial } from "../../types";

const SPEED_PX_PER_SECOND = 55;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ testimonial }: { testimonial: Testimonial }) {
  const avatar = testimonial.media;

  if (avatar?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar.url}
        alt={avatar.alt || ""}
        className="size-11 shrink-0 rounded-full object-cover ring-2 ring-clay/25"
        loading="lazy"
      />
    );
  }

  return (
    <span
      aria-hidden
      className="grid size-11 shrink-0 place-items-center rounded-full bg-forest text-sm font-semibold text-white"
    >
      {initials(testimonial.attribution) || "•"}
    </span>
  );
}

function CompactTestimonial({ testimonial }: { testimonial: Testimonial }) {
  const context = [testimonial.project, testimonial.location]
    .filter(Boolean)
    .join(" · ");
  const subtitle = testimonial.organization || testimonial.role;

  return (
    <figure className="flex w-[19rem] shrink-0 flex-col rounded-2xl border border-line bg-white p-5 shadow-card sm:w-[22rem]">
      <div className="flex items-center gap-3">
        <Avatar testimonial={testimonial} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {testimonial.attribution}
          </p>
          {subtitle ? (
            <p className="truncate text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>
        <Quote aria-hidden className="size-6 shrink-0 text-clay/50" />
      </div>
      <blockquote className="mt-4 line-clamp-4 text-sm leading-6 text-muted">
        {testimonial.quote}
      </blockquote>
      {context ? (
        <p className="mt-3 text-xs font-medium text-clay">{context}</p>
      ) : null}
    </figure>
  );
}

export function TestimonialMarquee({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const loop = testimonials.length >= 2;

  useEffect(() => {
    if (!loop || reducedMotion) return;

    const track = trackRef.current;
    if (!track) return;

    let half = track.scrollWidth / 2;
    let offset = 0;
    let last = performance.now();
    let frame = 0;

    const observer = new ResizeObserver(() => {
      half = track.scrollWidth / 2;
    });
    observer.observe(track);

    const tick = (now: number) => {
      const delta = Math.min(now - last, 64);
      last = now;

      if (!pausedRef.current && half > 0) {
        offset = (offset + (SPEED_PX_PER_SECOND * delta) / 1000) % half;
        track.style.transform = `translate3d(-${offset}px, 0, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [loop, reducedMotion]);

  if (!loop) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {testimonials.map((testimonial) => (
          <CompactTestimonial
            key={testimonial.slug}
            testimonial={testimonial}
          />
        ))}
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
        {testimonials.map((testimonial) => (
          <CompactTestimonial
            key={testimonial.slug}
            testimonial={testimonial}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div ref={trackRef} className="flex w-max">
          {[0, 1].map((group) => (
            <div
              key={group}
              className="flex shrink-0 gap-4 pr-4"
              aria-hidden={group === 1}
            >
              {testimonials.map((testimonial) => (
                <CompactTestimonial
                  key={`${group}-${testimonial.slug}`}
                  testimonial={testimonial}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}