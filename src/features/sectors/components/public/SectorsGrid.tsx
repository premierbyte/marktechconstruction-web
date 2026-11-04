import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { CapabilityCard, type Capability } from "@/features/capabilities";

export function SectorsGrid({ sectors }: { sectors: Capability[] }) {
  return (
    <Section>
      <Container>
        {sectors.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector, index) => (
              <CapabilityCard
                key={sector.slug}
                capability={sector}
                kind="sector"
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sectors are published yet"
            description="Published sector information will appear here."
            action={<ButtonLink href="/contact">Contact the team</ButtonLink>}
          />
        )}
      </Container>
    </Section>
  );
}
