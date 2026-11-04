import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/layout/Section";
import type { Testimonial } from "../../types";
import { TestimonialMarquee } from "./TestimonialMarquee";

export function TestimonialsShowcase({
  testimonials,
  eyebrow = "What our clients say",
  title,
  intro,
  action,
}: {
  testimonials: Testimonial[];
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden border-y border-line bg-gradient-to-br from-white via-sand/40 to-sand/70 py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="display mt-2 text-2xl leading-tight text-balance text-ink sm:text-3xl">
              {title}
            </h2>
            {intro ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {intro}
              </p>
            ) : null}
          </div>
          {action ? <div className="self-start sm:self-auto">{action}</div> : null}
        </div>

        <div className="mt-8">
          <TestimonialMarquee testimonials={testimonials} />
        </div>
      </Container>
    </section>
  );
}