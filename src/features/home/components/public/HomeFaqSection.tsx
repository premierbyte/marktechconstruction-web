import { ChevronRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import type { Faq } from "@/features/content";

export function HomeFaqSection({ faqs }: { faqs: Faq[] }) {
  const items = faqs.slice(0, 6);

  return (
    <Section className="border-y border-line bg-white">
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="FAQs"
            title="Questions, answered"
            intro="Straight answers about enquiries, projects and how your information is handled."
          />
          <ButtonLink href="/faqs" variant="secondary" className="mt-6">
            All FAQs
          </ButtonLink>
        </div>

        {items.length > 0 ? (
          <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {items.map((faq) => (
              <details key={faq.slug} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {faq.question}
                  <ChevronRight
                    aria-hidden
                    className="size-4 shrink-0 text-muted transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-6 text-sm leading-6 text-muted">
            Published FAQs will appear here. You can still contact the team with a
            question in the meantime.
          </div>
        )}
      </Container>
    </Section>
  );
}