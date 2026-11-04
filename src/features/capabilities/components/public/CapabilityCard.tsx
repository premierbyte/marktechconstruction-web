import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Primitives";
import type { Capability, CapabilityKind } from "../../types";

function ServiceCard({
  capability,
  index,
}: {
  capability: Capability;
  index?: number;
}) {
  const media = capability.media;

  return (
    <article className="group relative flex h-full min-h-[18rem] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-forest p-6 text-white transition-shadow hover:shadow-lift">
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt || ""}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-forest via-forest-soft to-clay/70"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/55 to-clay/25"
        aria-hidden
      />
      <Link
        href={`/services/${capability.slug}`}
        className="absolute inset-0 z-10"
        aria-label={capability.name}
      />
      <div className="relative">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-soft">
          {typeof index === "number"
            ? String(index + 1).padStart(2, "0")
            : "Service"}
        </span>
        <h3 className="display mt-2 text-2xl leading-tight text-white">
          {capability.name}
        </h3>
        {capability.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/80">
            {capability.summary}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/85">
          Explore
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}

export function CapabilityCard({
  capability,
  kind,
  index,
}: {
  capability: Capability;
  kind: CapabilityKind;
  index?: number;
}) {
  if (kind === "service") {
    return <ServiceCard capability={capability} index={index} />;
  }

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
          {typeof index === "number" ? String(index + 1).padStart(2, "0") : kind}
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-4 text-forest/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
      <h3 className="display mt-6 text-2xl leading-tight text-ink">
        <Link href={`/${kind}s/${capability.slug}`} className="after:absolute after:inset-0">
          {capability.name}
        </Link>
      </h3>
      {capability.summary ? (
        <p className="mt-3 text-sm leading-6 text-muted">{capability.summary}</p>
      ) : null}
      <div className="mt-auto pt-6">
        <Badge tone="outline">Sector</Badge>
      </div>
    </article>
  );
}