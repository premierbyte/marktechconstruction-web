import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export function SectorsCta() {
  return (
    <Section tone="sand">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="display text-3xl text-ink">
            Working in a different setting?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Share the building type and constraints. The team can confirm
            relevant experience before you invest time in a detailed brief.
          </p>
        </div>
        <ButtonLink href="/discuss-your-project" size="lg">
          Discuss your project
        </ButtonLink>
      </Container>
    </Section>
  );
}
