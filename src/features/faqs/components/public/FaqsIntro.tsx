import { Container, SectionHeading } from "@/components/layout/Section";

export function FaqsIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="FAQs"
          title="Answers before you enquire"
          intro="Straight answers about enquiries, project records and privacy. If something is still unclear, the team can answer it directly."
          as="h1"
        />
      </Container>
    </section>
  );
}
