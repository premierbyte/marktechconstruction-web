import { getContentPage, type ContentPage } from "@/features/content";
import {
  getCredentials,
  getTestimonials,
  type Credential,
  type Testimonial,
} from "@/features/credibility";
import { getPublicSettings, type SiteSettings } from "@/features/settings";

export type AboutContent = {
  settings: SiteSettings | null;
  testimonials: Testimonial[];
  credentials: Credential[];
  whyChoose: ContentPage | null;
  about: ContentPage | null;
  vision: ContentPage | null;
  mission: ContentPage | null;
};

export async function getAboutContent(): Promise<AboutContent> {
  const [settings, testimonials, credentials, whyChoose, about, vision, mission] =
    await Promise.all([
      getPublicSettings(),
      getTestimonials(),
      getCredentials(),
      getContentPage("why-choose-marktech"),
      getContentPage("about-marktech"),
      getContentPage("our-vision"),
      getContentPage("our-mission"),
    ]);

  return {
    settings,
    testimonials,
    credentials,
    whyChoose,
    about,
    vision,
    mission,
  };
}
