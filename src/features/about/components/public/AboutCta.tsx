import { ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export function AboutCta() {
  return (
    <Section tone="sand">
      <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="display text-3xl text-ink">Have a project in mind?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Share the location, project type and priorities. The team can
            explain what information is needed next.
          </p>
        </div>
        <ButtonLink href="/discuss-your-project" size="lg">
          Discuss your project <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      </Container>
    </Section>
  );
}
