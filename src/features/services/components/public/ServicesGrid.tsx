import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { CapabilityCard, type Capability } from "@/features/capabilities";

export function ServicesGrid({ services }: { services: Capability[] }) {
  return (
    <Section>
      <Container>
        {services.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <CapabilityCard
                key={service.slug}
                capability={service}
                kind="service"
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No services are published yet"
            description="Published services will appear here. You can still start a project conversation."
            action={
              <ButtonLink href="/discuss-your-project">
                Discuss your project
              </ButtonLink>
            }
          />
        )}
      </Container>
    </Section>
  );
}
