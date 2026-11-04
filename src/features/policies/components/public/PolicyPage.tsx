import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Prose } from "@/components/ui/Primitives";
import { getContentPage } from "@/features/content";
import { breadcrumbSchema, webPageSchema } from "@/lib/structured-data";
import { formatDate } from "@/lib/utils";
import { extractHeadings } from "../../utils/headings";
import { PolicyAside } from "./PolicyAside";

export async function PolicyPage({ slug }: { slug: string }) {
  const page = await getContentPage(slug);

  if (!page) {
    notFound();
  }

  const updated = formatDate(page.updated_on);
  const headings = extractHeadings(page.body);

  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: page.title, path: `/policies/${page.slug}` },
    ]),
    webPageSchema({
      name: page.title,
      description: page.summary,
      path: `/policies/${page.slug}`,
      image: page.media?.url,
    }),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <section className="border-b border-line bg-sand">
        <Container className="py-12 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-muted"
          >
            <Link className="hover:text-forest" href="/">
              Home
            </Link>
            <ChevronRight aria-hidden className="size-3" />
            <span className="text-ink">Policies</span>
            <ChevronRight aria-hidden className="size-3" />
            <span aria-current="page" className="text-ink">
              {page.title}
            </span>
          </nav>
          <h1 className="display mt-6 max-w-3xl text-4xl leading-tight text-ink sm:text-5xl">
            {page.title}
          </h1>
          {updated ? (
            <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
          ) : null}
        </Container>
      </section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
          <PolicyAside headings={headings} demo={page.demo} />
          <div>
            {page.summary ? (
              <p className="mb-6 text-lg leading-8 text-ink/75">
                {page.summary}
              </p>
            ) : null}
            <Prose text={page.body} className="max-w-none" />
          </div>
        </Container>
      </Section>
    </>
  );
}
