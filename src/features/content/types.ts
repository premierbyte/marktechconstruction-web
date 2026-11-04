export type ContentMember = {
  name: string;
  role?: string | null;
  avatar?: {
    asset_id?: string;
    url?: string;
    alt?: string | null;
  } | null;
};

export type ContentPage = {
  slug: string;
  title: string;
  summary?: string | null;
  body?: string | null;
  category?: string | null;
  updated_on?: string | null;
  media?: {
    asset_id?: string;
    url?: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
    credit?: string | null;
  } | null;
  members?: ContentMember[] | null;
  seo?: { title?: string; description?: string } | null;
  demo?: boolean;
};

export type Faq = {
  slug: string;
  question: string;
  answer: string;
  category: string;
  related_service_slug?: string | null;
  sort_order?: number;
  demo?: boolean;
};
