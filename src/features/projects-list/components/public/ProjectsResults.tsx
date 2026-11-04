import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { ProjectCard, type ProjectList } from "@/features/projects";

export function ProjectsResults({
  result,
  hasFilters,
}: {
  result: ProjectList | null;
  hasFilters: boolean;
}) {
  const projects = result?.data ?? [];

  if (result === null) {
    return (
      <div className="mt-6 rounded-2xl border border-clay/30 bg-clay/5 p-8 text-center">
        <h2 className="display text-2xl text-ink">
          Projects could not be loaded
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
          This is a temporary failure, not an empty portfolio. Try again or
          contact the team directly.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/projects">Try again</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (projects.length > 0) {
    return (
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            priority={index === 0}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <EmptyState
        title={
          hasFilters
            ? "No projects match these filters"
            : "No projects are published yet"
        }
        description={
          hasFilters
            ? "Try removing one filter or reset the selection. The team may still have relevant experience."
            : "Only approved case studies appear publicly. You can still discuss a similar project with the team."
        }
        action={
          hasFilters ? (
            <ButtonLink href="/projects" variant="secondary">
              Reset filters
            </ButtonLink>
          ) : (
            <ButtonLink href="/discuss-your-project">
              Discuss your project
            </ButtonLink>
          )
        }
      />
    </div>
  );
}
