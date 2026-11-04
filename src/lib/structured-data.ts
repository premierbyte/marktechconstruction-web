import { absoluteUrl, SITE_URL } from "@/lib/seo";
import type { Capability, CapabilityKind } from "@/features/capabilities/types";
import type { Vacancy } from "@/features/careers/types";
import type { Insight } from "@/features/insights/types";
import type { Project } from "@/features/projects/types";
import type { SiteSettings } from "@/features/settings/types";

type Json = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function compact(value: Json): Json {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ""),
  );
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

function imageUrl(value: string | null | undefined): string | undefined {
  return value ? absoluteUrl(value) : undefined;
}

function plainText(html: string | null | undefined): string | undefined {
  if (!html) return undefined;

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function organizationSchema(settings: SiteSettings | null): Json {
  const company = settings?.company ?? {};
  const contact = settings?.contact ?? {};
  const branding = settings?.branding ?? {};
  const logo = imageUrl(branding.logo?.url) ?? absoluteUrl("/logo.png");

  const address = compact({
    "@type": "PostalAddress",
    streetAddress: (contact.address_lines ?? []).filter(Boolean).join(", ") || undefined,
    addressLocality: contact.city,
    addressRegion: contact.region,
    postalCode: contact.postal_code,
    addressCountry: contact.country,
  });

  const sameAs = (settings?.social ?? []).map((item) => item.href).filter(Boolean);

  return compact({
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": ORGANIZATION_ID,
    name: company.name || "Construction company",
    legalName: company.legal_name,
    description: company.description,
    slogan: company.tagline,
    url: `${SITE_URL}/`,
    logo,
    image: logo,
    email: contact.email,
    telephone: contact.phone,
    address: Object.keys(address).length > 1 ? address : undefined,
    areaServed: contact.service_area,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  });
}

export function websiteSchema(settings: SiteSettings | null): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: settings?.company?.name || "Construction company",
    url: `${SITE_URL}/`,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  });
}

export function breadcrumbSchema(items: { name: string; path?: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.path ? absoluteUrl(item.path) : undefined,
      }),
    ),
  };
}

export function articleSchema(insight: Insight): Json {
  const url = absoluteUrl(`/insights/${insight.slug}`);

  return compact({
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: truncate(insight.title, 110),
    description: insight.summary ?? undefined,
    image: imageUrl(insight.media?.url),
    datePublished: insight.published_on ?? undefined,
    dateModified: insight.published_on ?? undefined,
    articleSection: insight.category ?? undefined,
    author: insight.author_name
      ? { "@type": "Person", name: insight.author_name }
      : { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  });
}

export function capabilitySchema(capability: Capability, kind: CapabilityKind): Json {
  const url = absoluteUrl(`/${kind}s/${capability.slug}`);

  if (kind === "sector") {
    return compact({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: capability.name,
      description: capability.summary ?? undefined,
      url,
      image: imageUrl(capability.media?.url),
      isPartOf: { "@id": WEBSITE_ID },
    });
  }

  return compact({
    "@context": "https://schema.org",
    "@type": "Service",
    name: capability.name,
    description: capability.summary ?? undefined,
    url,
    image: imageUrl(capability.media?.url),
    provider: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  });
}

export function projectSchema(project: Project): Json {
  const url = absoluteUrl(`/projects/${project.slug}`);
  const services = (project.services ?? []).map((service) => service.name).filter(Boolean);

  return compact({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: truncate(project.title, 110),
    description: project.summary ?? undefined,
    url,
    image: imageUrl(project.cover?.url),
    dateCreated: project.started_on ?? undefined,
    dateModified: project.completed_on ?? project.started_on ?? undefined,
    creator: { "@id": ORGANIZATION_ID },
    about: services.length > 0 ? services.join(", ") : undefined,
  });
}

export function faqSchema(faqs: { question?: string; answer?: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((faq) => faq.question && faq.answer)
      .map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: plainText(faq.answer),
        },
      })),
  };
}

function employmentTypeEnum(value: string | null | undefined): string | undefined {
  const key = (value ?? "").toLowerCase().replace(/[\s-]+/g, "_");

  const map: Record<string, string> = {
    full_time: "FULL_TIME",
    part_time: "PART_TIME",
    contractor: "CONTRACTOR",
    contract: "CONTRACTOR",
    temporary: "TEMPORARY",
    intern: "INTERN",
    internship: "INTERN",
  };

  return map[key];
}

export function jobPostingSchema(vacancy: Vacancy, settings: SiteSettings | null): Json {
  const url = absoluteUrl(`/careers/${vacancy.slug}`);
  const company = settings?.company?.name || "Construction company";

  return compact({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description: plainText(vacancy.body) || vacancy.summary || undefined,
    datePosted: vacancy.date_posted ?? undefined,
    validThrough: vacancy.closing_on ?? undefined,
    employmentType: employmentTypeEnum(vacancy.employment_type),
    hiringOrganization: { "@id": ORGANIZATION_ID, name: company },
    jobLocation: vacancy.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: vacancy.location,
          },
        }
      : undefined,
    url,
    identifier: { "@type": "PropertyValue", name: company, value: vacancy.slug },
  });
}

export function webPageSchema({
  name,
  description,
  path,
  image,
}: {
  name: string;
  description?: string | null;
  path: string;
  image?: string | null;
}): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description: description ?? undefined,
    url: absoluteUrl(path),
    image: imageUrl(image),
    isPartOf: { "@id": WEBSITE_ID },
  });
}