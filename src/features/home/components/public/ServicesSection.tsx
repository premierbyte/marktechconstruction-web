import { Container, Eyebrow, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import type { Capability } from "@/features/capabilities";
import { ServicePreviewCard } from "./ServicePreviewCard";

export function ServicesSection({ services }: { services: Capability[] }) {
  const primaryServices = services.slice(0, 3);

  return (
    <Section
      tone="forest"
      className="relative overflow-hidden border-y border-forest/40"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-clay/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Capabilities</Eyebrow>
            <h2 className="display mt-3 text-balance text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
              Services shaped around the project
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              Each service explains what is included, how the work is approached
              and how to request a project-specific proposal.
            </p>
          </div>
          <ButtonLink
            href="/services"
            variant="light"
            className="self-start lg:self-auto"
          >
            All services
          </ButtonLink>
        </div>

        {primaryServices.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {primaryServices.map((service, index) => (
              <ServicePreviewCard
                key={service.slug}
                service={service}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="Services are being prepared"
              description="Published services will appear here. In the meantime, you can still start a project conversation."
              action={
                <ButtonLink href="/discuss-your-project">
                  Discuss your project
                </ButtonLink>
              }
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
