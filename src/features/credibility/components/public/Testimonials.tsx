import { Quote } from "lucide-react";
import type { Testimonial } from "../../types";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const context = [testimonial.project, testimonial.location]
    .filter(Boolean)
    .join(" · ");
  const background = [
    testimonial.based_in ? `Based in ${testimonial.based_in}` : null,
    testimonial.year,
  ]
    .filter(Boolean)
    .join(" · ");
  const attributionLine = testimonial.organization || testimonial.role;

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
      <Quote aria-hidden className="size-6 text-clay" />
      {testimonial.headline ? (
        <p className="display mt-4 text-xl leading-snug text-ink">
          {testimonial.headline}
        </p>
      ) : null}
      <blockquote className="mt-3 flex-1 text-sm leading-6 text-muted">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-6 border-t border-line pt-4 text-sm">
        <span className="font-semibold text-ink">{testimonial.attribution}</span>
        {attributionLine ? (
          <span className="mt-1 block text-xs text-muted">{attributionLine}</span>
        ) : null}
        {context ? (
          <span className="mt-1 block text-xs text-muted">{context}</span>
        ) : null}
        {background ? (
          <span className="mt-1 block text-xs text-muted">{background}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function TestimonialGrid({
  testimonials,
  limit,
}: {
  testimonials: Testimonial[];
  limit?: number;
}) {
  const items =
    typeof limit === "number" ? testimonials.slice(0, limit) : testimonials;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((testimonial) => (
        <TestimonialCard key={testimonial.slug} testimonial={testimonial} />
      ))}
    </div>
  );
}
