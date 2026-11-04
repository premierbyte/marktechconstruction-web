import { Container, SectionHeading } from "@/components/layout/Section";

export function SectorsIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Sectors"
          title="Experience applied to the setting"
          intro="Different building uses bring different constraints. Sector pages explain the relevant capabilities and approved project examples."
          as="h1"
        />
      </Container>
    </section>
  );
}
