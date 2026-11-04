import { Container, Section } from "@/components/layout/Section";
import { EnquiryForm } from "@/features/enquiries";
import { getDiscussContent } from "../../api/server";
import type { SearchParamsRecord } from "../../utils/params";
import { BriefAside } from "./BriefAside";
import { DiscussIntro } from "./DiscussIntro";
import { ServiceSuggestions } from "./ServiceSuggestions";

export async function DiscussProjectPage({
  searchParams,
}: {
  searchParams: SearchParamsRecord;
}) {
  const { settings, services, sectors, service, sector } =
    await getDiscussContent(searchParams);

  const enquiry = settings?.enquiry;

  return (
    <>
      <DiscussIntro />
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <BriefAside responseWindow={enquiry?.response_window} />
          <EnquiryForm
            mode="project"
            services={services.map(({ slug, name }) => ({ slug, name }))}
            sectors={sectors.map(({ slug, name }) => ({ slug, name }))}
            privacyVersion={enquiry?.privacy_version}
            privacySlug={enquiry?.privacy_notice_slug || "privacy"}
            responseWindow={enquiry?.response_window}
            budgetBands={enquiry?.budget_bands}
            startPeriods={enquiry?.start_periods}
            defaultService={service}
            defaultSector={sector}
          />
        </Container>
      </Section>
      <ServiceSuggestions services={services} />
    </>
  );
}
