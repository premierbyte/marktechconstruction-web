import { Container, SectionHeading } from "@/components/layout/Section";

export function DiscussIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Project enquiry"
          title="Start with the brief"
          intro="Share enough for the team to understand the project, the stage and the constraints. An enquiry is a conversation request, not a booking or a contract."
          as="h1"
        />
      </Container>
    </section>
  );
}
