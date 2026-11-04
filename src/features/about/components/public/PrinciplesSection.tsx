import { Compass, FileCheck2, ShieldCheck, Users } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/layout/Section";

const PRINCIPLES = [
  {
    icon: Users,
    title: "Direct communication",
    copy: "One clear point of contact, agreed reporting rhythms and decisions recorded so everyone works from the same information.",
  },
  {
    icon: FileCheck2,
    title: "Defined scope",
    copy: "Inclusions, exclusions, dependencies and responsibilities are set out before work is committed.",
  },
  {
    icon: ShieldCheck,
    title: "Managed risk",
    copy: "Health, safety and buildability are considered as part of planning, not added after decisions are made.",
  },
  {
    icon: Compass,
    title: "Practical judgement",
    copy: "Recommendations respond to the building, the brief and the constraints rather than a one-size-fits-all process.",
  },
];

export function PrinciplesSection() {
  return (
    <Section>
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow="How we think"
          title="Principles that hold a project together"
          intro="These principles describe the working approach. Specific policies, certifications and leadership profiles require approval before publication."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <principle.icon aria-hidden className="size-6 text-clay" />
              <h3 className="mt-5 text-lg font-semibold text-ink">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {principle.copy}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
