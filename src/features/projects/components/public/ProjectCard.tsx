import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectLocation } from "../../types";

export function projectLocationLabel(location: ProjectLocation | undefined): string | null {
  if (!location) return null;

  if (typeof location === "string") return location;

  return location.label || [location.city, location.region].filter(Boolean).join(", ") || null;
}

const VISUALS = [
  "from-forest via-forest-soft to-clay/70",
  "from-[#101a3a] via-[#2a3f73] to-[#4f6d9e]",
  "from-[#0b3a5c] via-clay to-clay-soft",
];

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const location = projectLocationLabel(project.location);
  const ongoing = project.status === "ongoing";
  const cover = project.cover;

  return (
    <article className="group relative flex h-full min-h-[20rem] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-forest p-6 text-white transition-shadow hover:shadow-lift">
      {cover?.url ? (
        <Image
          src={cover.url}
          alt={cover.alt || ""}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            VISUALS[project.slug.length % VISUALS.length],
          )}
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/55 to-clay/25"
        aria-hidden
      />
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-10"
        aria-label={project.title}
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold",
              ongoing
                ? "bg-clay text-white"
                : "bg-white/15 text-white backdrop-blur",
            )}
          >
            {ongoing ? "Ongoing" : "Completed"}
          </span>
          {project.sectors?.slice(0, 2).map((sector) => (
            <span key={sector.slug} className="text-xs font-medium text-clay-soft">
              {sector.name}
            </span>
          ))}
        </div>

        <h3 className="display mt-3 text-2xl leading-tight text-white">
          {project.title}
        </h3>

        {project.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/80">
            {project.summary}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-4 text-xs text-white/75">
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden className="size-3.5" />
              {location}
            </span>
          ) : (
            <span />
          )}
          <ArrowUpRight
            aria-hidden
            className="size-4 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </article>
  );
}