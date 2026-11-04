import { Images } from "lucide-react";
import { Container, SectionHeading } from "@/components/layout/Section";

export function GalleryIntro() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-sand">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-clay/10 blur-3xl"
        aria-hidden
      />
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Gallery"
            title="Built work, captured"
            intro="Photographs from completed and ongoing projects, published by the team and updated as work progresses."
            as="h1"
          />
          <p className="inline-flex items-center gap-2 self-start rounded-full border border-forest/15 bg-paper px-4 py-2 text-xs font-semibold text-forest lg:self-auto">
            <Images aria-hidden className="size-4 text-clay" />
            Project photography
          </p>
        </div>
      </Container>
    </section>
  );
}