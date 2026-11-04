import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Prose } from "@/components/ui/Primitives";
import { ProjectCard, type Project } from "@/features/projects";
import { breadcrumbSchema, capabilitySchema, faqSchema } from "@/lib/structured-data";
import type { Capability, CapabilityKind } from "../../types";

const labels = {
  service: { singular: "Service", plural: "Services", eyebrow: "Capability" },
  sector: { singular: "Sector", plural: "Sectors", eyebrow: "Sector focus" },
} as const;

export function CapabilityDetail({
  capability,
  kind,
  relatedProjects,
}: {
  capability: Capability;
  kind: CapabilityKind;
  relatedProjects: Project[];
}) {
  const label = labels[kind];
  const enquiryHref = `/discuss-your-project?${kind}=${encodeURIComponent(capability.slug)}`;

  const schemas: Record<string, unknown>[] = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: label.plural, path: `/${kind}s` },
      { name: capability.name, path: `/${kind}s/${capability.slug}` },
    ]),
    capabilitySchema(capability, kind),
  ];

  if (capability.faqs && capability.faqs.length > 0) {
    schemas.push(faqSchema(capability.faqs));
  }

  return (
    <>
      <JsonLd data={schemas} />
      <section className="border-b border-line bg-sand">
        <Container className="py-12 sm:py-16 lg:py-20">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-muted"
          >
            <Link className="hover:text-forest" href="/">
              Home
            </Link>
            <ChevronRight aria-hidden className="size-3" />
            <Link className="hover:text-forest" href={`/${kind}s`}>
              {label.plural}
            </Link>
            <ChevronRight aria-hidden className="size-3" />
            <span aria-current="page" className="text-ink">
              {capability.name}
            </span>
          </nav>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <Badge tone="clay">{label.eyebrow}</Badge>
              <h1 className="display mt-5 max-w-4xl text-4xl leading-[1.05] text-balance text-ink sm:text-5xl lg:text-6xl">
                {capability.name}
              </h1>
              {capability.summary ? (
                <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/75">
                  {capability.summary}
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-forest/15 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                Next step
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Share the project location and brief. The team will explain what
                happens next and whether this is the right capability for the
                work.
              </p>
              <ButtonLink href={enquiryHref} className="mt-5 w-full">
                Discuss this project{" "}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[1fr_0.38fr]">
          <div className="space-y-12">
            {capability.body ? (
              <div>
                <h2 className="display text-3xl text-ink">The work</h2>
                <Prose className="mt-4" text={capability.body} />
              </div>
            ) : null}

            {capability.deliverables && capability.deliverables.length > 0 ? (
              <div>
                <h2 className="display text-3xl text-ink">
                  What the engagement includes
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {capability.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-xl border border-line bg-white p-4 text-sm leading-6 text-muted"
                    >
                      <Check
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-clay"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {capability.process && capability.process.length > 0 ? (
              <div>
                <h2 className="display text-3xl text-ink">How it progresses</h2>
                <ol className="mt-5 space-y-4">
                  {capability.process.map((step, index) => (
                    <li
                      key={`${step.title}-${index}`}
                      className="flex gap-5 border-b border-line pb-5 last:border-0"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-ink">{step.title}</h3>
                        {step.description ? (
                          <p className="mt-1 text-sm leading-6 text-muted">
                            {step.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {capability.faqs && capability.faqs.length > 0 ? (
              <div>
                <h2 className="display text-3xl text-ink">Questions</h2>
                <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
                  {capability.faqs.map((faq, index) =>
                    faq.question && faq.answer ? (
                      <details
                        key={`${faq.question}-${index}`}
                        className="group p-5"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                          {faq.question}
                          <ChevronRight
                            aria-hidden
                            className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90"
                          />
                        </summary>
                        <p className="mt-3 text-sm leading-6 text-muted">
                          {faq.answer}
                        </p>
                      </details>
                    ) : null,
                  )}
                </div>
              </div>
            ) : null}

            {relatedProjects.length > 0 ? (
              <div>
                <h2 className="display text-3xl text-ink">Related projects</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {relatedProjects.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-forest p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-soft">
                Project enquiry
              </p>
              <h2 className="display mt-3 text-2xl">Start with the brief.</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                No account is needed. You will receive a reference when the
                enquiry is safely stored.
              </p>
              <ButtonLink
                href={enquiryHref}
                variant="light"
                className="mt-5 w-full"
              >
                Discuss your project
              </ButtonLink>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                Browse
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <Link
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-mist"
                  href={`/${kind}s`}
                >
                  All {label.plural.toLowerCase()}{" "}
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
                <Link
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-mist"
                  href="/projects"
                >
                  Projects <ChevronRight aria-hidden className="size-4" />
                </Link>
                <Link
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-mist"
                  href="/contact"
                >
                  Contact <ChevronRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
