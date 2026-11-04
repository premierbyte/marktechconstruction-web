import { Suspense } from "react";
import { Container, Section } from "@/components/layout/Section";
import type { ProjectFilters } from "@/features/projects";
import { getFilteredProjects } from "../../api/server";
import {
  parseProjectFilters,
  type SearchParamsRecord,
} from "../../utils/filters";
import { ProjectsFilterForm } from "./ProjectsFilterForm";
import { ProjectsIntro } from "./ProjectsIntro";
import { ProjectsPagination } from "./ProjectsPagination";
import { ProjectsResults } from "./ProjectsResults";
import { ProjectsSkeleton } from "./ProjectsSkeleton";

export function ProjectsPage({
  searchParams,
}: {
  searchParams: SearchParamsRecord;
}) {
  const filters = parseProjectFilters(searchParams);
  const hasFilters = Boolean(
    filters.status || filters.sector || filters.service || filters.location,
  );
  const contentKey = JSON.stringify(filters);

  return (
    <>
      <ProjectsIntro />
      <Section>
        <Container>
          <Suspense key={contentKey} fallback={<ProjectsSkeleton />}>
            <ProjectsContent
              searchParams={searchParams}
              filters={filters}
              hasFilters={hasFilters}
            />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}

async function ProjectsContent({
  searchParams,
  filters,
  hasFilters,
}: {
  searchParams: SearchParamsRecord;
  filters: ProjectFilters;
  hasFilters: boolean;
}) {
  const result = await getFilteredProjects(searchParams);
  const meta = result?.meta;

  return (
    <>
      <ProjectsFilterForm filters={filters} meta={meta} hasFilters={hasFilters} />

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          {result
            ? `${meta?.total ?? 0} ${meta?.total === 1 ? "project" : "projects"} found`
            : "Project results are temporarily unavailable"}
        </p>
        {meta && meta.last_page > 1 ? (
          <p className="text-xs text-muted">
            Page {meta.current_page} of {meta.last_page}
          </p>
        ) : null}
      </div>

      <ProjectsResults result={result} hasFilters={hasFilters} />
      <ProjectsPagination filters={filters} meta={meta} />
    </>
  );
}