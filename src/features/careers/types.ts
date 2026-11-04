export type Vacancy = {
  slug: string;
  title: string;
  summary?: string | null;
  body?: string | null;
  status?: "open" | "closed" | string | null;
  location?: string | null;
  employment_type?: string | null;
  date_posted?: string | null;
  closing_on?: string | null;
  seo?: { title?: string; description?: string } | null;
  demo?: boolean;
};