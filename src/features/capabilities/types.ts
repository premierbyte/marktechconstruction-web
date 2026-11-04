export type FaqItem = {
  question?: string;
  answer?: string;
};

export type Capability = {
  slug: string;
  name: string;
  summary?: string | null;
  media?: {
    url?: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  body?: string | null;
  deliverables?: string[];
  process?: { title?: string; description?: string }[];
  faqs?: FaqItem[];
  related_project_slugs?: string[];
  seo?: { title?: string; description?: string } | null;
};

export type CapabilityKind = "service" | "sector";
