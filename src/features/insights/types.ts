export type Insight = {
  slug: string;
  title: string;
  summary?: string | null;
  category?: string | null;
  author_name?: string | null;
  published_on?: string | null;
  body?: string | null;
  media?: {
    asset_id?: string;
    url?: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
    credit?: string | null;
  } | null;
  related_service_slugs?: string[];
  seo?: { title?: string; description?: string } | null;
  demo?: boolean;
};