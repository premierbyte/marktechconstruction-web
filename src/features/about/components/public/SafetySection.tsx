import {
  Container,
  Section,
  SectionHeading,
} from "@/components/layout/Section";
import { Prose } from "@/components/ui/Primitives";

const EXPECTATIONS = [
  "A named project team and clear communication route",
  "Method statements and risk controls appropriate to the work",
  "Change decisions recorded before they affect delivery",
  "Handover information agreed at the outset",
];

export function SafetySection() {
  return (
    <Section tone="white">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Health and safety"
            title="Planned into the work, not added afterwards"
            intro="A construction project brings people, plant and changing conditions together. The delivery approach should make responsibilities and controls visible."
          />
          <Prose
            className="mt-6"
            text={
              "Approved health and safety policies, accreditations and competence evidence belong in this section. They are only published when current, verifiable and approved for public use."
            }
          />
        </div>
        <div className="bg-forest relative overflow-hidden rounded-2xl p-8 text-white">
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-clay-soft">
            What to expect
          </p>
          <ul className="relative mt-6 space-y-4 text-sm leading-6 text-white/80">
            {EXPECTATIONS.map((item) => (
              <li
                key={item}
                className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
