import { Container, SectionHeading } from "@/components/layout/Section";

export function ProjectsIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Projects"
          title="Evidence, not adjectives"
          intro="Explore approved case studies. Filters only show categories represented in currently published projects."
          as="h1"
        />
      </Container>
    </section>
  );
}
