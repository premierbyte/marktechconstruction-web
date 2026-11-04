import Link from "next/link";
import { ArrowRight, Briefcase, CalendarDays, MapPin } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, EmptyState } from "@/components/ui/Primitives";
import { formatDate } from "@/lib/utils";
import { getVacancies } from "../../api/server";
import type { Vacancy } from "../../types";
import { CareersIntro } from "./CareersIntro";

function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const isOpen = vacancy.status === "open";
  const closing = formatDate(vacancy.closing_on);

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-lift">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={isOpen ? "forest" : "neutral"}>{isOpen ? "Open" : "Closed"}</Badge>
        {vacancy.employment_type ? <Badge tone="outline">{vacancy.employment_type}</Badge> : null}
      </div>

      <h3 className="display mt-3 text-2xl leading-tight text-ink">
        <Link href={`/careers/${vacancy.slug}`} className="hover:text-forest">
          {vacancy.title}
        </Link>
      </h3>

      {vacancy.summary ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{vacancy.summary}</p>
      ) : null}

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        {vacancy.location ? (
          <div className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden className="size-3.5 text-clay" />
            <dt className="sr-only">Location</dt>
            <dd>{vacancy.location}</dd>
          </div>
        ) : null}
        {vacancy.employment_type ? (
          <div className="inline-flex items-center gap-1.5">
            <Briefcase aria-hidden className="size-3.5 text-clay" />
            <dt className="sr-only">Employment type</dt>
            <dd>{vacancy.employment_type}</dd>
          </div>
        ) : null}
        {closing ? (
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-3.5 text-clay" />
            <dt className="sr-only">Closing date</dt>
            <dd>{isOpen ? `Closes ${closing}` : `Closed ${closing}`}</dd>
          </div>
        ) : null}
      </dl>

      <Link
        href={`/careers/${vacancy.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-clay"
      >
        View role <ArrowRight aria-hidden className="size-4" />
      </Link>
    </article>
  );
}

function VacancyGroup({
  title,
  description,
  vacancies,
}: {
  title: string;
  description?: string;
  vacancies: Vacancy[];
}) {
  if (vacancies.length === 0) return null;

  return (
    <section aria-labelledby={`careers-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="max-w-2xl">
        <h2 id={`careers-${title.replace(/\s+/g, "-").toLowerCase()}`} className="display text-3xl text-ink">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {vacancies.map((vacancy) => (
          <VacancyCard key={vacancy.slug} vacancy={vacancy} />
        ))}
      </div>
    </section>
  );
}

export async function CareersPage() {
  const vacancies = await getVacancies();
  const open = vacancies.filter((vacancy) => vacancy.status === "open");
  const closed = vacancies.filter((vacancy) => vacancy.status !== "open");

  return (
    <>
      <CareersIntro />
      <Section>
        <Container className="max-w-5xl">
          {vacancies.length === 0 ? (
            <EmptyState
              title="No vacancies right now"
              description="There are no published openings at the moment. You can still get in touch to introduce yourself."
              action={<ButtonLink href="/contact">Contact the team</ButtonLink>}
            />
          ) : (
            <div className="space-y-14">
              {open.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-6 text-sm leading-6 text-muted">
                  There are no open roles at the moment. Closed roles are listed below for reference.
                </div>
              ) : null}

              <VacancyGroup
                title="Open roles"
                description="Applications are open for these positions."
                vacancies={open}
              />

              <VacancyGroup
                title="Closed roles"
                description="These positions are no longer accepting applications."
                vacancies={closed}
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}