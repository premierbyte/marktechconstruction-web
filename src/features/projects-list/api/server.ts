import { getProjects, type ProjectList } from "@/features/projects";
import {
  parseProjectFilters,
  type SearchParamsRecord,
} from "../utils/filters";

export async function getFilteredProjects(
  searchParams: SearchParamsRecord,
): Promise<ProjectList | null> {
  return getProjects(parseProjectFilters(searchParams));
}
