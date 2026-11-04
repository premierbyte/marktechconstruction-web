import type { Project } from "@/features/projects";

export function ProjectMedia({ project }: { project: Project }) {
  return (
    <div className="blueprint relative aspect-[16/7] overflow-hidden rounded-2xl">
      <div className="absolute inset-0 site-grid opacity-30" />
      {project.cover?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover.url}
          alt={project.cover.alt || ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-end p-8 sm:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Project record
            </p>
            <p className="display mt-3 max-w-xl text-3xl text-white sm:text-4xl">
              {project.title}
            </p>
            {project.demo ? (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-clay-soft">
                Demonstration content
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
