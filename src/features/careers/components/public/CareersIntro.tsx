import { Container, SectionHeading } from "@/components/layout/Section";

export function CareersIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Careers"
          title="Build your career with us"
          intro="Current opportunities to join the team. Each role lists its location, type and closing date."
          as="h1"
        />
      </Container>
    </section>
  );
}