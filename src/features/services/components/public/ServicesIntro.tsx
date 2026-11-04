import { Container } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/Section";

export function ServicesIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Services"
          title="Capabilities, explained clearly"
          intro="Each service sets out the work, typical deliverables and process. Inclusions and exclusions are confirmed in a project-specific proposal."
          as="h1"
        />
      </Container>
    </section>
  );
}
