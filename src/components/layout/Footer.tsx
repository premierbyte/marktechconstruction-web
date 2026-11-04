import Link from "next/link";
import Image from "next/image";
import { Clock, Globe, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "./Container";
import {
  DEFAULT_NAVIGATION,
  withGalleryLink,
  type SiteSettings,
} from "@/features/settings";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const companyName = settings?.company?.name || "Construction company";
  const legalName = settings?.company?.legal_name || companyName;
  const logoUrl = settings?.branding?.logo?.url || "/logo.png";
  const navigation = withGalleryLink(
    settings?.navigation && settings.navigation.length > 0
      ? settings.navigation
      : DEFAULT_NAVIGATION,
  );
  const contact = settings?.contact;
  const year = new Date().getFullYear();
  const address = [
    ...(contact?.address_lines ?? []),
    contact?.city,
    contact?.region,
    contact?.postal_code,
  ].filter(Boolean);

  return (
    <footer className="mt-auto border-t border-white/10 bg-ink text-white">
      <Container className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src={logoUrl}
              alt={`${legalName} logo`}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-lg bg-white object-contain p-1"
            />
            <span className="text-lg font-bold">{companyName}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
            {settings?.company?.description ||
              "Company information will appear here once it is published."}
          </p>
          {settings?.demo ? (
            <p className="mt-4 inline-flex rounded-full bg-clay/20 px-3 py-1 text-xs font-semibold text-clay-soft">
              Demonstration content
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navigation.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  className="text-white/75 hover:text-white"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="text-white/75 hover:text-white" href="/faqs">
                FAQs
              </Link>
            </li>
            <li>
              <Link
                className="text-white/75 hover:text-white"
                href="/policies/privacy"
              >
                Privacy notice
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Contact
          </h2>
          <address className="mt-4 space-y-3 text-sm not-italic text-white/75">
            {address.length > 0 ? (
              <p className="flex gap-3">
                <MapPin
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-clay-soft"
                />
                <span>{address.join(", ")}</span>
              </p>
            ) : null}
            {contact?.phone ? (
              <p className="flex gap-3">
                <Phone
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-clay-soft"
                />
                <a
                  className="hover:text-white"
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                >
                  {contact.phone}
                </a>
              </p>
            ) : null}
            {contact?.email ? (
              <p className="flex gap-3">
                <Mail
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-clay-soft"
                />
                <a
                  className="break-all hover:text-white"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              </p>
            ) : null}
            {contact?.business_hours ? (
              <p className="flex gap-3">
                <Clock
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-clay-soft"
                />
                <span>{contact.business_hours}</span>
              </p>
            ) : null}
            {contact?.timezone ? (
              <p className="flex gap-3 text-white/50">
                <Globe
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-clay-soft/70"
                />
                <span>{contact.timezone}</span>
              </p>
            ) : null}
          </address>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {legalName}. All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://premierbyte.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Premierbyte
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
