import { CheckCircle2 } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export function EnquiryCtaSection() {
  return (
    <Section tone="forest">
      <Container className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-soft">
            Project enquiries
          </p>
          <h2 className="display mt-4 max-w-3xl text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            Tell us what you are planning.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            Share the location, project type and what you want to achieve. A
            useful brief helps the team respond with the right next step.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <ButtonLink href="/discuss-your-project" variant="light" size="lg">
            Start a project enquiry
          </ButtonLink>
          <ButtonLink
            href="/contact"
            variant="secondary"
            size="lg"
            className="border-white/25 text-white hover:bg-white/10"
          >
            Contact details
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
