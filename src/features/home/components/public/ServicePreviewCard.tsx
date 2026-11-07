import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Capability } from "@/features/capabilities";

export function ServicePreviewCard({
  service,
  index = 0,
}: {
  service: Capability;
  index?: number;
}) {
  const media = service.media;

  const imageBaseUrl = process.env.INTERNAL_API_URL || "";

  return (
    <article className="group relative flex h-full min-h-[18rem] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:border-clay/40 hover:shadow-lift">
      {media?.url ? (
        <Image
          src={`${imageBaseUrl}/${media.url}`}
          alt={media.alt || ""}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-forest-soft to-clay/70"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/92 via-forest/60 to-clay/25"
        aria-hidden
      />
      <Link
        href={`/services/${service.slug}`}
        className="absolute inset-0 z-10"
        aria-label={service.name}
      />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-soft">
          {String(index + 1).padStart(2, "0")} · Service
        </p>
        <h3 className="display mt-2 text-2xl leading-tight text-white">
          {service.name}
        </h3>
        {service.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/80">
            {service.summary}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition-colors group-hover:text-clay-soft">
          Explore service
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  );
}
