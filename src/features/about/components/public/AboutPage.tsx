import { CredentialsShowcase } from "@/features/credibility";
import { getAboutContent } from "../../api/server";
import { AboutCta } from "./AboutCta";
import { AboutHero } from "./AboutHero";
import { ClientsSection } from "./ClientsSection";
import { CompanyOverviewSection } from "./CompanyOverviewSection";
import { PrinciplesSection } from "./PrinciplesSection";
import { SafetySection } from "./SafetySection";
import { VisionMissionSection } from "./VisionMissionSection";
import { WhyChooseSection } from "./WhyChooseSection";

export async function AboutPage() {
  const { settings, testimonials, credentials, whyChoose, about, vision, mission } =
    await getAboutContent();

  return (
    <>
      <AboutHero settings={settings} />
      <CompanyOverviewSection page={about} />
      <VisionMissionSection vision={vision} mission={mission} />
      <PrinciplesSection />
      <WhyChooseSection page={whyChoose} />
      <ClientsSection testimonials={testimonials} />
      <CredentialsShowcase credentials={credentials} />
      <SafetySection />
      <AboutCta />
    </>
  );
}
