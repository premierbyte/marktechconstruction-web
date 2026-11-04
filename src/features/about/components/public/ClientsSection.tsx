import { ButtonLink } from "@/components/ui/Button";
import { TestimonialsShowcase, type Testimonial } from "@/features/credibility";

export function ClientsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <TestimonialsShowcase
      testimonials={testimonials}
      eyebrow="What our clients say"
      title="Trusted by our clients. Recommended for quality."
      intro="Client-approved statements about their experience with our team."
      action={
        <ButtonLink href="/projects" variant="secondary" size="sm">
          Browse projects
        </ButtonLink>
      }
    />
  );
}