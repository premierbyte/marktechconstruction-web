import { Prose } from "@/components/ui/Primitives";

export type NarrativeSection = { title: string; text?: string | null };

export function ProjectNarrative({
  sections,
}: {
  sections: NarrativeSection[];
}) {
  if (sections.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted">
        A detailed case-study narrative has not been published for this project.
      </p>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="display text-3xl text-ink">{section.title}</h2>
          <Prose className="mt-4" text={section.text} />
        </section>
      ))}
    </>
  );
}
