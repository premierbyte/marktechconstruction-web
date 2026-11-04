import { getCapabilities, type Capability } from "@/features/capabilities";
import { getFaqs, type Faq } from "@/features/content";
import { getTestimonials, type Testimonial } from "@/features/credibility";
import { getInsights, type Insight } from "@/features/insights";
import { getFeaturedProjects, type Project } from "@/features/projects";
import { getPublicSettings, type SiteSettings } from "@/features/settings";

export type HomeContent = {
  settings: SiteSettings | null;
  services: Capability[];
  projects: Project[];
  testimonials: Testimonial[];
  insights: Insight[];
  faqs: Faq[];
};

export async function getHomeContent(): Promise<HomeContent> {
  const [settings, services, projects, testimonials, insights, faqs] =
    await Promise.all([
      getPublicSettings(),
      getCapabilities("service"),
      getFeaturedProjects(3),
      getTestimonials(),
      getInsights(),
      getFaqs(),
    ]);

  return { settings, services, projects, testimonials, insights, faqs };
}
