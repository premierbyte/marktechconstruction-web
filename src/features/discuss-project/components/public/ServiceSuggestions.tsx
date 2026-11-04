import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { CapabilityCard, type Capability } from "@/features/capabilities";

export function ServiceSuggestions({ services }: { services: Capability[] }) {
  if (services.length === 0) {
    return null;
  }

  return (
    <Section tone="sand">
      <Container>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Services"
            title="Not sure which route fits?"
          />
          <p className="max-w-md text-sm leading-6 text-muted">
            Read how each service is scoped, or select “Not sure yet” in the form
            and describe the project.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item, index) => (
            <CapabilityCard
              key={item.slug}
              capability={item}
              kind="service"
              index={index}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
