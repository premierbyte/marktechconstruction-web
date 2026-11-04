export type Credential = {
  slug: string;
  name: string;
  issuer: string;
  applicable_entity?: string | null;
  evidence_reference?: string | null;
  expires_on?: string | null;
  review_on?: string | null;
  summary?: string | null;
  media?: {
    url?: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
    caption?: string | null;
    credit?: string | null;
  } | null;
  sort_order?: number;
  demo?: boolean;
};

export type Testimonial = {
  slug: string;
  headline?: string | null;
  quote: string;
  attribution: string;
  role?: string | null;
  organization?: string | null;
  project?: string | null;
  location?: string | null;
  based_in?: string | null;
  year?: string | null;
  source?: string | null;
  media?: {
    url?: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
    caption?: string | null;
    credit?: string | null;
  } | null;
  demo?: boolean;
};
