import { Container, Section } from "@/components/layout/Section";
import { EnquiryForm } from "@/features/enquiries";
import { getContactContent } from "../../api/server";
import { ContactDetails } from "./ContactDetails";
import { ContactIntro } from "./ContactIntro";

export async function ContactPage() {
  const settings = await getContactContent();
  const enquiry = settings?.enquiry;

  return (
    <>
      <ContactIntro />
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <ContactDetails settings={settings} />
          <EnquiryForm
            mode="general"
            services={[]}
            sectors={[]}
            privacyVersion={enquiry?.privacy_version}
            privacySlug={enquiry?.privacy_notice_slug || "privacy"}
            responseWindow={enquiry?.response_window}
          />
        </Container>
      </Section>
    </>
  );
}
