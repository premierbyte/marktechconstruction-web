import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { Prose } from "@/components/ui/Primitives";
import type { ContentPage } from "@/features/content";

export function CompanyOverviewSection({ page }: { page: ContentPage | null }) {
  if (!page) {
    return null;
  }

  return (
    <Section tone="white">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <SectionHeading
          eyebrow="About Marktech"
          title={page.title}
          intro={page.summary}
        />
        <Prose text={page.body} className="max-w-none" />
      </Container>
    </Section>
  );
}