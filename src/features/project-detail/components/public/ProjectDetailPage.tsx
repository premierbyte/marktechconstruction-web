import { notFound } from "next/navigation";
import { Container, Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProject } from "@/features/projects";
import { breadcrumbSchema, projectSchema } from "@/lib/structured-data";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectHero } from "./ProjectHero";
import { ProjectMedia } from "./ProjectMedia";
import { ProjectNarrative, type NarrativeSection } from "./ProjectNarrative";
import { ProjectSidebar } from "./ProjectSidebar";

export async function ProjectDetailPage({ slug }: { slug: string }) {
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const ongoing = project.status === "ongoing";
  const sections: NarrativeSection[] = [
    { title: "Scope", text: project.scope },
    { title: "Challenges", text: project.challenges },
    { title: "Approach", text: project.approach },
    { title: "Outcomes", text: project.outcomes },
  ].filter((section) => Boolean(section.text));

  const schemas = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${project.slug}` },
    ]),
    projectSchema(project),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <ProjectHero project={project} />
      <Section>
        <Container>
          <ProjectMedia project={project} />

          {ongoing ? (
            <div className="mt-6 rounded-xl border border-clay/30 bg-clay/5 p-5 text-sm leading-6 text-ink">
              This project is ongoing. Information describes the current project
              record and does not imply completion.
            </div>
          ) : null}

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.35fr]">
            <div className="space-y-10">
              <ProjectNarrative sections={sections} />
              <ProjectGallery images={project.gallery ?? []} />
            </div>
            <ProjectSidebar project={project} />
          </div>
        </Container>
      </Section>
    </>
  );
}
