import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Prose } from "@/components/ui/Primitives";
import { articleSchema, breadcrumbSchema } from "@/lib/structured-data";
import { formatDate } from "@/lib/utils";
import { getInsight } from "../../api/server";

export async function InsightDetail({ slug }: { slug: string }) {
  const insight = await getInsight(slug);

  if (!insight) {
    notFound();
  }

  const date = formatDate(insight.published_on);
  const cover = insight.media;

  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Insights", path: "/insights" },
      { name: insight.title, path: `/insights/${insight.slug}` },
    ]),
    articleSchema(insight),
  ];

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
            <Link className="hover:text-forest" href="/insights">
              Insights
            </Link>
            <ChevronRight aria-hidden className="size-3" />
            <span aria-current="page" className="text-ink">
              {insight.title}
            </span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <Badge tone="clay">Insight</Badge>
            <h1 className="display mt-5 text-4xl leading-[1.05] text-balance text-ink sm:text-5xl">
              {insight.title}
            </h1>
            {insight.summary ? (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/75">
                {insight.summary}
              </p>
            ) : null}
            {date ? (
              <p className="mt-4 text-sm text-muted">Published {date}</p>
            ) : null}
          </div>
        </Container>
      </section>

      <Section>
        <Container className="max-w-4xl">
          {cover?.url ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line">
              <Image
                src={cover.url}
                alt={cover.alt || insight.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          ) : null}

          <Prose text={insight.body} className="mt-8 max-w-none" />

          <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
            <ButtonLink href="/insights" variant="secondary">
              Back to insights
            </ButtonLink>
            <ButtonLink href="/discuss-your-project">
              Discuss your project
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}