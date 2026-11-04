import { getHomeContent } from "../../api/server";
import { EnquiryCtaSection } from "./EnquiryCtaSection";
import { Hero } from "./Hero";
import { HomeFaqSection } from "./HomeFaqSection";
import { InsightsSection } from "./InsightsSection";
import { SelectedWorkSection } from "./SelectedWorkSection";
import { ServicesSection } from "./ServicesSection";
import { TestimonialsSection } from "./TestimonialsSection";

export async function HomePage() {
  const { settings, services, projects, testimonials, insights, faqs } =
    await getHomeContent();

  return (
    <>
      <Hero settings={settings} />
      <ServicesSection services={services} />
      <SelectedWorkSection projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <InsightsSection insights={insights} />
      <HomeFaqSection faqs={faqs} />
      <EnquiryCtaSection />
    </>
  );
}
