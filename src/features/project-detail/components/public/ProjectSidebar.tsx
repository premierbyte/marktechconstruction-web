import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { Project } from "@/features/projects";

export function ProjectSidebar({ project }: { project: Project }) {
  const discussionHref = project.services?.[0]
    ? `/discuss-your-project?service=${encodeURIComponent(project.services[0].slug)}`
    : "/discuss-your-project";

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl bg-forest p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-soft">
          Similar project?
        </p>
        <h2 className="display mt-3 text-2xl">Start with your brief.</h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Share the location, building type and priorities. The team will
          explain the next step.
        </p>
        <ButtonLink
          href={discussionHref}
          variant="light"
          className="mt-5 w-full"
        >
          Discuss your project <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      </div>
      <ButtonLink href="/projects" variant="secondary" className="w-full">
        All projects
      </ButtonLink>
    </aside>
  );
}
