import type { Metadata } from "next";
import { getPublicSettings } from "@/features/settings";
import { getServices } from "@/features/services";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import { SupportWidget } from "@/features/support";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const name = settings?.company?.name || "Building contractor";

  return {
    applicationName: name,
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description:
      settings?.company?.description ||
      "Construction services, project case studies and project enquiries.",
    icons: {
      icon: settings?.branding?.favicon?.url || "/icon.png",
      apple: settings?.branding?.favicon?.url || "/apple-icon.png",
    },
    openGraph: {
      siteName: name,
      locale: "en",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, services] = await Promise.all([
    getPublicSettings(),
    getServices(),
  ]);

  const serviceLinks = services.map(({ slug, name, summary }) => ({
    slug,
    name,
    summary,
  }));

  return (
    <>
      <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      {settings?.demo ? <DemoBanner /> : null}
      <Header settings={settings} services={serviceLinks} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <SupportWidget />
    </>
  );
}
