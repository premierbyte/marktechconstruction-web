import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Primitives";
import { projectLocationLabel, type Project } from "@/features/projects";
import { formatDate } from "@/lib/utils";

export function ProjectHero({ project }: { project: Project }) {
  const location = projectLocationLabel(project.location);
  const ongoing = project.status === "ongoing";

  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-10 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-muted"
        >
          <Link className="hover:text-forest" href="/">
            Home
          </Link>
          <ChevronRight aria-hidden className="size-3" />
          <Link className="hover:text-forest" href="/projects">
            Projects
          </Link>
          <ChevronRight aria-hidden className="size-3" />
          <span aria-current="page" className="text-ink">
            {project.title}
          </span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.45fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ongoing ? "clay" : "forest"}>
                {ongoing ? "Ongoing project" : "Completed project"}
              </Badge>
              {project.sectors?.map((sector) => (
                <Link key={sector.slug} href={`/sectors/${sector.slug}`}>
                  <Badge tone="outline">{sector.name}</Badge>
                </Link>
              ))}
            </div>
            <h1 className="display mt-5 max-w-4xl text-4xl leading-[1.05] text-balance text-ink sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            {project.summary ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/75">
                {project.summary}
              </p>
            ) : null}
          </div>
          <dl className="grid gap-4 rounded-2xl border border-forest/15 bg-white p-6 text-sm">
            {location ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Location
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-semibold text-ink">
                  <MapPin aria-hidden className="size-3.5 text-clay" />{" "}
                  {location}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Status
              </dt>
              <dd className="mt-1 font-semibold text-ink">
                {ongoing ? "Ongoing" : "Completed"}
              </dd>
            </div>
            {formatDate(project.completed_on) ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Completed
                </dt>
                <dd className="mt-1 font-semibold text-ink">
                  {formatDate(project.completed_on)}
                </dd>
              </div>
            ) : null}
            {project.services && project.services.length > 0 ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  Services
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {project.services.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="text-sm font-semibold text-forest hover:underline"
                    >
                      {service.name}
                    </Link>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </Container>
    </section>
  );
}
