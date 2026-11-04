export type FieldType =
  | "text"
  | "textarea"
  | "rich"
  | "number"
  | "checkbox"
  | "select"
  | "date"
  | "string-list"
  | "pair-list"
  | "faq-list"
  | "member-list"
  | "media"
  | "media-list";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type ColumnDef = { key: string; label: string };

export type ResourceConfig = {
  key: string;
  api: string;
  slugBase: string;
  title: string;
  description: string;
  titleKey: string;
  permissionEdit: string;
  permissionPublish: string;
  singleton?: boolean;
  singletonWorkflow?: boolean;
  idParam: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  listQuery?: Record<string, string>;
  defaults?: Record<string, unknown>;
};

const seoFields: FieldDef[] = [
  { name: "seo.title", label: "SEO title", type: "text" },
  { name: "seo.description", label: "SEO description", type: "textarea" },
];

export const resources = {
  pages: {
    key: "pages",
    api: "/api/v1/admin/pages",
    slugBase: "/admin/pages",
    title: "Pages",
    description: "Policy and standalone content pages.",
    titleKey: "title",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "page",
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "category", label: "Category", type: "text" },
      { name: "body", label: "Body", type: "rich", help: "Supports headings, lists and links." },
      { name: "media.asset_id", label: "Cover image", type: "media", help: "Shown on insight cards." },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "members", label: "Team members", type: "member-list", help: "Name, role and optional photo. Shown on the team page." },
      ...seoFields,
    ],
  },
  insights: {
    key: "insights",
    api: "/api/v1/admin/insights",
    slugBase: "/admin/insights",
    title: "Insights",
    description: "Blog articles and practical notes published to the public insights feed.",
    titleKey: "title",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "insight",
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", help: "Short intro shown on insight cards and search results." },
      { name: "category", label: "Category", type: "text", help: "Groups articles on the public insights feed." },
      { name: "author_name", label: "Author", type: "text" },
      { name: "published_on", label: "Published on", type: "date", help: "Shown as the article date on the public insights feed." },
      { name: "media.asset_id", label: "Cover image", type: "media", help: "Displayed on insight cards and the article header." },
      { name: "body", label: "Body", type: "rich", help: "Supports headings, lists and links." },
      { name: "related_service_slugs", label: "Related service slugs", type: "string-list" },
      { name: "sort_order", label: "Sort order", type: "number" },
      ...seoFields,
    ],
  },
  careers: {
    key: "careers",
    api: "/api/v1/admin/vacancies",
    slugBase: "/admin/careers",
    title: "Careers",
    description: "Job vacancies and opportunities published to the public careers feed.",
    titleKey: "title",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "vacancy",
    defaults: { status: "open" },
    columns: [
      { key: "title", label: "Title" },
      { key: "status", label: "Status" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ],
      },
      { name: "location", label: "Location", type: "text" },
      { name: "employment_type", label: "Employment type", type: "text", help: "e.g. Full-time, Contract." },
      { name: "date_posted", label: "Posted on", type: "date", help: "Publishing date used for job posting metadata." },
      { name: "closing_on", label: "Closing on", type: "date" },
      { name: "body", label: "Body", type: "rich", help: "Role description, responsibilities and requirements." },
      { name: "sort_order", label: "Sort order", type: "number" },
      ...seoFields,
    ],
  },
  faqs: {
    key: "faqs",
    api: "/api/v1/admin/faqs",
    slugBase: "/admin/faqs",
    title: "FAQs",
    description: "Categorised practical answers.",
    titleKey: "question",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "faq",
    columns: [
      { key: "title", label: "Question" },
      { key: "category", label: "Category" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "related_service_slug", label: "Related service slug", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  services: {
    key: "services",
    api: "/api/v1/admin/services",
    slugBase: "/admin/services",
    title: "Services",
    description: "Construction services and how they are scoped.",
    titleKey: "name",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "service",
    columns: [
      { key: "slug", label: "Slug" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "media.asset_id", label: "Cover image", type: "media", help: "Background image used on service cards." },
      { name: "body", label: "Body", type: "rich" },
      { name: "deliverables", label: "Deliverables", type: "string-list" },
      { name: "process", label: "Process steps", type: "pair-list" },
      { name: "faqs", label: "FAQs", type: "faq-list" },
      { name: "related_project_slugs", label: "Related project slugs", type: "string-list" },
      { name: "sort_order", label: "Sort order", type: "number" },
      ...seoFields,
    ],
  },
  sectors: {
    key: "sectors",
    api: "/api/v1/admin/sectors",
    slugBase: "/admin/sectors",
    title: "Sectors",
    description: "Sector-specific capability content.",
    titleKey: "name",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "sector",
    columns: [
      { key: "slug", label: "Slug" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "body", label: "Body", type: "rich" },
      { name: "deliverables", label: "Deliverables", type: "string-list" },
      { name: "related_project_slugs", label: "Related project slugs", type: "string-list" },
      { name: "sort_order", label: "Sort order", type: "number" },
      ...seoFields,
    ],
  },
  projects: {
    key: "projects",
    api: "/api/v1/admin/projects",
    slugBase: "/admin/projects",
    title: "Projects",
    description: "Approved case studies and portfolio records.",
    titleKey: "title",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "project",
    columns: [
      { key: "title", label: "Title" },
      { key: "status", label: "Status" },
      { key: "location", label: "Location" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea" },
      {
        name: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "completed", label: "Completed" },
          { value: "ongoing", label: "Ongoing" },
        ],
      },
      { name: "location.label", label: "Location label", type: "text", help: "City or region only." },
      { name: "location.city", label: "City", type: "text" },
      { name: "location.region", label: "Region", type: "text" },
      { name: "sectors", label: "Sectors", type: "pair-list" },
      { name: "services", label: "Services", type: "pair-list" },
      { name: "scope", label: "Scope", type: "rich" },
      { name: "challenges", label: "Challenges", type: "rich" },
      { name: "approach", label: "Approach", type: "rich" },
      { name: "outcomes", label: "Outcomes", type: "rich" },
      { name: "started_on", label: "Started on", type: "date" },
      { name: "completed_on", label: "Completed on", type: "date" },
      { name: "cover.asset_id", label: "Cover image", type: "media" },
      { name: "gallery", label: "Gallery", type: "media-list" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "sort_order", label: "Sort order", type: "number" },
      ...seoFields,
    ],
  },
  testimonials: {
    key: "testimonials",
    api: "/api/v1/admin/testimonials",
    slugBase: "/admin/testimonials",
    title: "Testimonials",
    description: "Evidence-backed client quotes.",
    titleKey: "attribution",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "testimonial",
    columns: [
      { key: "slug", label: "Slug" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "headline", label: "Headline", type: "text", help: "Short pull-quote shown above the full testimonial." },
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "attribution", label: "Attribution", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "organization", label: "Organization", type: "text" },
      { name: "project", label: "Project", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "based_in", label: "Based in", type: "text" },
      { name: "year", label: "Year", type: "text" },
      { name: "consent_reference", label: "Consent reference", type: "text", required: true, help: "Where consent is recorded." },
      { name: "source", label: "Source", type: "text" },
      { name: "media_asset_id", label: "Photo", type: "media" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  credentials: {
    key: "credentials",
    api: "/api/v1/admin/credentials",
    slugBase: "/admin/credentials",
    title: "Credentials",
    description: "Certifications and accreditations with review dates.",
    titleKey: "name",
    permissionEdit: "content.edit",
    permissionPublish: "content.publish",
    idParam: "credential",
    columns: [
      { key: "slug", label: "Slug" },
      { key: "expires_on", label: "Expires" },
      { key: "state", label: "State" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text", required: true },
      { name: "applicable_entity", label: "Applicable entity", type: "text" },
      { name: "evidence_reference", label: "Evidence reference", type: "text", required: true },
      { name: "expires_on", label: "Expires on", type: "date" },
      { name: "review_on", label: "Review on", type: "date" },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "media_asset_id", label: "Evidence image", type: "media" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  settings: {
    key: "settings",
    api: "/api/v1/admin/settings",
    slugBase: "/admin/settings",
    title: "Site settings",
    description: "Company details, contact information and enquiry configuration.",
    titleKey: "company.name",
    permissionEdit: "settings.manage",
    permissionPublish: "settings.manage",
    singleton: true,
    singletonWorkflow: true,
    idParam: "settings",
    columns: [],
    fields: [
      { name: "company.name", label: "Company name", type: "text" },
      { name: "company.legal_name", label: "Legal name", type: "text", help: "Registered legal name." },
      { name: "company.tagline", label: "Tagline", type: "text" },
      { name: "company.description", label: "Description", type: "textarea" },
      { name: "brand.primary_color", label: "Primary colour", type: "text", help: "Hex value, e.g. #203090" },
      { name: "brand.accent_color", label: "Accent colour", type: "text" },
      { name: "contact.email", label: "Contact email", type: "text" },
      { name: "contact.phone", label: "Contact phone", type: "text" },
      { name: "contact.address_lines", label: "Address lines", type: "string-list", help: "Street address lines." },
      { name: "contact.service_area", label: "Service area", type: "text" },
      { name: "contact.business_hours", label: "Business hours", type: "text" },
      { name: "contact.timezone", label: "Timezone", type: "text" },
      { name: "contact.city", label: "City", type: "text" },
      { name: "contact.region", label: "Region", type: "text" },
      { name: "contact.postal_code", label: "Postal code", type: "text" },
      { name: "contact.country", label: "Country", type: "text" },
      { name: "enquiry.response_window", label: "Response window", type: "text" },
      { name: "enquiry.privacy_version", label: "Privacy version", type: "text" },
      { name: "enquiry.privacy_notice_slug", label: "Privacy notice slug", type: "text" },
    ],
  },
} satisfies Record<string, ResourceConfig>;
