import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { ProjectCard, type Project } from "@/features/projects";

export function SelectedWorkSection({ projects }: { projects: Project[] }) {
  return (
    <Section tone="sand">
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          title="Projects with the detail that matters"
          intro="Approved case studies show scope, approach and context. Ongoing work is labelled clearly and never presented as complete."
          action={
            <ButtonLink href="/projects" variant="secondary">
              Browse projects
            </ButtonLink>
          }
        />
        {projects.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="No projects are published yet"
              description="Only approved case studies appear publicly. You can still discuss a similar project with the team."
              action={
                <ButtonLink href="/discuss-your-project">
                  Start a conversation
                </ButtonLink>
              }
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
