import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Prose } from "@/components/ui/Primitives";
import { getPublicSettings } from "@/features/settings";
import { breadcrumbSchema, jobPostingSchema, webPageSchema } from "@/lib/structured-data";
import { formatDate } from "@/lib/utils";
import { getVacancy } from "../../api/server";

export async function CareerDetail({ slug }: { slug: string }) {
  const [vacancy, settings] = await Promise.all([getVacancy(slug), getPublicSettings()]);

  if (!vacancy) {
    notFound();
  }

  const isOpen = vacancy.status === "open";
  const posted = formatDate(vacancy.date_posted);
  const closing = formatDate(vacancy.closing_on);
  const email = settings?.contact?.email;
  const applyHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Application: ${vacancy.title}`)}`
    : "/contact";

  const schemas: Record<string, unknown>[] = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Careers", path: "/careers" },
      { name: vacancy.title, path: `/careers/${vacancy.slug}` },
    ]),
    webPageSchema({
      name: vacancy.title,
      description: vacancy.summary,
      path: `/careers/${vacancy.slug}`,
    }),
  ];

  // Google requires datePosted for JobPosting. Only emit the schema when the
  // editor has recorded a posting date.
  if (vacancy.date_posted) {
    schemas.push(jobPostingSchema(vacancy, settings));
  }

  return (
    <>
      <JsonLd data={schemas} />

      <section className="border-b border-line bg-sand">
        <Container className="py-12 sm:py-16 lg:py-20">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <Link className="hover:text-forest" href="/">Home</Link>
            <ChevronRight aria-hidden className="size-3" />
            <Link className="hover:text-forest" href="/careers">Careers</Link>
            <ChevronRight aria-hidden className="size-3" />
            <span aria-current="page" className="text-ink">{vacancy.title}</span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={isOpen ? "forest" : "neutral"}>{isOpen ? "Open" : "Closed"}</Badge>
              {vacancy.employment_type ? <Badge tone="outline">{vacancy.employment_type}</Badge> : null}
            </div>
            <h1 className="display mt-5 text-4xl leading-[1.05] text-balance text-ink sm:text-5xl">
              {vacancy.title}
            </h1>
            {vacancy.summary ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/75">{vacancy.summary}</p>
            ) : null}

            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {vacancy.location ? (
                <div className="inline-flex items-center gap-2">
                  <MapPin aria-hidden className="size-4 text-clay" />
                  <dt className="sr-only">Location</dt>
                  <dd>{vacancy.location}</dd>
                </div>
              ) : null}
              {vacancy.employment_type ? (
                <div className="inline-flex items-center gap-2">
                  <Briefcase aria-hidden className="size-4 text-clay" />
                  <dt className="sr-only">Employment type</dt>
                  <dd>{vacancy.employment_type}</dd>
                </div>
              ) : null}
              {posted ? (
                <div className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden className="size-4 text-clay" />
                  <dt className="sr-only">Posted</dt>
                  <dd>Posted {posted}</dd>
                </div>
              ) : null}
              {closing ? (
                <div className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden className="size-4 text-clay" />
                  <dt className="sr-only">Closing date</dt>
                  <dd>{isOpen ? `Closes ${closing}` : `Closed ${closing}`}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_0.36fr]">
          <div>
            {vacancy.body ? (
              <Prose text={vacancy.body} className="max-w-none" />
            ) : vacancy.summary ? (
              <p className="text-lg leading-8 text-ink/75">{vacancy.summary}</p>
            ) : (
              <p className="text-sm leading-6 text-muted">
                The full role description will be published shortly. Please use the contact option to ask for details.
              </p>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-forest p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-soft">
                {isOpen ? "Apply" : "Closed"}
              </p>
              <h2 className="display mt-3 text-2xl">
                {isOpen ? "Send your application" : "This role is closed"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {isOpen
                  ? "Email your CV and a short covering note. Include the role title in the subject line."
                  : "This vacancy is no longer accepting applications. Browse open roles instead."}
              </p>
              {isOpen ? (
                <ButtonLink href={applyHref} variant="light" className="mt-5 w-full">
                  Apply for this role
                </ButtonLink>
              ) : (
                <ButtonLink href="/careers" variant="light" className="mt-5 w-full">
                  View open roles
                </ButtonLink>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Careers</p>
              <Link
                className="mt-3 inline-flex items-center gap-2 font-semibold text-forest hover:text-clay"
                href="/careers"
              >
                <ArrowLeft aria-hidden className="size-4" /> All vacancies
              </Link>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}