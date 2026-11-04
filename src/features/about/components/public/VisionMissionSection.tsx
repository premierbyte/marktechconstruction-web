import { Compass, Target } from "lucide-react";
import { Container, Section } from "@/components/layout/Section";
import { Prose } from "@/components/ui/Primitives";
import type { ContentPage } from "@/features/content";

export function VisionMissionSection({
  vision,
  mission,
}: {
  vision: ContentPage | null;
  mission: ContentPage | null;
}) {
  const cards = [
    { page: vision, Icon: Compass },
    { page: mission, Icon: Target },
  ].filter(
    (item): item is { page: ContentPage; Icon: typeof Compass } =>
      item.page !== null,
  );

  if (cards.length === 0) {
    return null;
  }

  return (
    <Section>
      <Container className="grid gap-6 lg:grid-cols-2">
        {cards.map(({ page, Icon }) => (
          <div
            key={page.slug}
            className="rounded-2xl border border-line bg-white p-8 shadow-card"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-clay/10 text-clay">
              <Icon aria-hidden className="size-5" />
            </span>
            <h2 className="display mt-5 text-3xl leading-tight text-ink">
              {page.title}
            </h2>
            {page.summary ? (
              <p className="mt-2 text-sm leading-6 text-muted">{page.summary}</p>
            ) : null}
            <Prose text={page.body} className="mt-4 max-w-none" />
          </div>
        ))}
      </Container>
    </Section>
  );
}