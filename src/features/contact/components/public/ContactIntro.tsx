import { Container, SectionHeading } from "@/components/layout/Section";

export function ContactIntro() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to the team"
          intro="Use the general enquiry form for company, supplier or non-project questions. For a construction project, the project enquiry form asks for the details needed to route your request."
          as="h1"
        />
      </Container>
    </section>
  );
}
