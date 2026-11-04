import { Container, Section } from "@/components/layout/Section";
import { ProjectsSkeleton } from "@/features/projects-list";

export default function ProjectsLoading() {
  return (
    <Section>
      <Container>
        <ProjectsSkeleton />
      </Container>
    </Section>
  );
}
