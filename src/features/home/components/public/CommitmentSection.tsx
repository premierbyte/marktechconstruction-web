import { ArrowRight, FileCheck2, MessagesSquare, PenLine } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

const PILLARS = [
  {
    icon: PenLine,
    title: "Scope in writing",
    copy: "Scope, programme and responsibilities are agreed before work starts.",
  },
  {
    icon: FileCheck2,
    title: "Decisions recorded",
    copy: "Approvals, variations and payments are documented as the project proceeds.",
  },
  {
    icon: MessagesSquare,
    title: "One clear channel",
    copy: "Progress and next steps are shared directly with the people making decisions.",
  },
] as const;

export function CommitmentSection({
  headline,
  intro,
}: {
  headline: string;
  intro?: string | null;
}) {
  return (
    <Section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-1/2 size-[34rem] -translate-y-1/2 rounded-full bg-clay/20 blur-3xl" />
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-forest-soft/40 blur-3xl" />
        <div className="site-grid absolute inset-0 opacity-[0.08]" />
      </div>

      <Container className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-soft">
            Our standard
          </p>
          <h2 className="display mt-4 max-w-2xl text-balance text-3xl leading-[1.08] text-white sm:text-4xl lg:text-5xl">
            {headline}
          </h2>
          {intro ? (
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{intro}</p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/discuss-your-project" variant="light" size="lg">
              Discuss your project <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/about"
              variant="secondary"
              size="lg"
              className="border-white/25 text-white hover:bg-white/10"
            >
              About the company
            </ButtonLink>
          </div>
        </div>

        <ul className="space-y-3">
          {PILLARS.map((pillar, index) => (
            <li
              key={pillar.title}
              className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-clay-soft/40 hover:bg-white/[0.07]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-clay/20 text-clay-soft">
                <pillar.icon aria-hidden className="size-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="display mt-1 text-xl text-white">{pillar.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-white/65">{pillar.copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}