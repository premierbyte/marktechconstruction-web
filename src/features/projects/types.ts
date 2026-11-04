export type ProjectLocation =
  | string
  | {
      label?: string;
      city?: string;
      region?: string;
      country?: string;
    }
  | null;

export type Project = {
  slug: string;
  title: string;
  summary?: string | null;
  status?: "completed" | "ongoing" | string;
  location?: ProjectLocation;
  sectors?: { slug: string; name: string }[];
  services?: { slug: string; name: string }[];
  scope?: string | null;
  challenges?: string | null;
  approach?: string | null;
  outcomes?: string | null;
  started_on?: string | null;
  completed_on?: string | null;
  cover?: { url?: string; alt?: string } | null;
  gallery?: { url?: string; alt?: string; caption?: string; credit?: string }[];
  featured?: boolean;
  seo?: { title?: string; description?: string } | null;
  demo?: boolean;
};

export type ProjectFilterOptions = {
  sectors: { slug: string; name: string }[];
  services: { slug: string; name: string }[];
  locations: string[];
};

export type ProjectMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  filters: ProjectFilterOptions;
};

export type ProjectList = {
  data: Project[];
  meta: ProjectMeta;
  links: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
};

export type ProjectFilters = {
  status?: string;
  sector?: string;
  service?: string;
  location?: string;
  page?: number;
  per_page?: number;
};
