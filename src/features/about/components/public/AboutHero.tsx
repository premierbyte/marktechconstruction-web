import { Container } from "@/components/layout/Section";
import { Badge, Prose } from "@/components/ui/Primitives";
import type { SiteSettings } from "@/features/settings";

export function AboutHero({ settings }: { settings: SiteSettings | null }) {
  const company = settings?.company;
  const contact = settings?.contact;

  return (
    <section className="border-b border-line bg-sand">
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:py-24">
        <div>
          <Badge tone="clay">About</Badge>
          <h1 className="display mt-6 max-w-4xl text-4xl leading-[1.05] text-balance text-ink sm:text-5xl lg:text-6xl">
            {company?.name || "A construction company"}
          </h1>
          <Prose
            className="mt-6 text-lg leading-8 text-ink/75"
            text={
              company?.description ||
              "Company information, history and approved leadership content will be published here."
            }
          />
        </div>
        <div className="rounded-2xl border border-forest/15 bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
            At a glance
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-6 border-b border-line pb-4">
              <dt className="text-muted">Service area</dt>
              <dd className="text-right font-semibold text-ink">
                {contact?.service_area || "Not configured"}
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-b border-line pb-4">
              <dt className="text-muted">Based in</dt>
              <dd className="text-right font-semibold text-ink">
                {[contact?.city, contact?.region].filter(Boolean).join(", ") ||
                  "Not configured"}
              </dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-muted">Business hours</dt>
              <dd className="text-right font-semibold text-ink">
                {contact?.business_hours || "Not configured"}
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}
