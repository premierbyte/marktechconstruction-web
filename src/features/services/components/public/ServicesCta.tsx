import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export function ServicesCta() {
  return (
    <Section tone="forest">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="display text-3xl text-white">
            Not sure which service fits?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
            Describe the project and the constraints. The first conversation can
            establish the right route.
          </p>
        </div>
        <ButtonLink href="/discuss-your-project" variant="light" size="lg">
          Start a conversation
        </ButtonLink>
      </Container>
    </Section>
  );
}
