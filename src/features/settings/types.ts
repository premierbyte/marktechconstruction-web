export type NavigationItem = {
  label: string;
  href: string;
};

export type HeroSlide = {
  eyebrow?: string;
  title?: string;
  description?: string;
  media?: {
    asset_id?: string;
    url?: string;
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  primary_label?: string;
  primary_href?: string;
  secondary_label?: string;
  secondary_href?: string;
};

export type SiteSettings = {
  demo?: boolean;
  company?: {
    name?: string;
    legal_name?: string;
    tagline?: string;
    description?: string;
  } | null;
  brand?: {
    primary_color?: string;
    accent_color?: string;
  } | null;
  branding?: {
    logo?: {
      asset_id?: string;
      url?: string;
      alt?: string | null;
    } | null;
    favicon?: {
      asset_id?: string;
      url?: string;
      alt?: string | null;
    } | null;
  } | null;
  hero?: {
    slides?: HeroSlide[];
  } | null;
  contact?: {
    email?: string;
    phone?: string;
    address_lines?: string[];
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    service_area?: string;
    business_hours?: string;
    timezone?: string;
    map_url?: string;
  } | null;
  enquiry?: {
    response_window?: string;
    privacy_version?: string;
    privacy_notice_slug?: string;
    budget_bands?: string[];
    start_periods?: string[];
  } | null;
  social?: { label: string; href: string }[];
  navigation?: NavigationItem[];
};

export const DEFAULT_NAVIGATION: NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Sectors", href: "/sectors" },
  { label: "Contact", href: "/contact" },
];

export function withGalleryLink(items: NavigationItem[]): NavigationItem[] {
  if (items.some((item) => item.href === "/gallery")) return items;

  const gallery = { label: "Gallery", href: "/gallery" };
  const contactIndex = items.findIndex((item) => item.href === "/contact");

  if (contactIndex === -1) return [...items, gallery];

  return [...items.slice(0, contactIndex), gallery, ...items.slice(contactIndex)];
}
