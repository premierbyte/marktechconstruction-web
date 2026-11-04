import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/features/settings";

export function ContactDetails({ settings }: { settings: SiteSettings | null }) {
  const contact = settings?.contact;
  const enquiry = settings?.enquiry;
  const address = [
    ...(contact?.address_lines ?? []),
    contact?.city,
    contact?.region,
    contact?.postal_code,
    contact?.country,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="display text-2xl text-ink">Company details</h2>
        <ul className="mt-4 space-y-4 text-sm leading-6 text-muted">
          {address.length > 0 ? (
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-clay" />
              <span>{address.join(", ")}</span>
            </li>
          ) : null}
          {contact?.phone ? (
            <li className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-clay" />
              <a
                className="font-semibold text-forest hover:underline"
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
              >
                {contact.phone}
              </a>
            </li>
          ) : null}
          {contact?.email ? (
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-clay" />
              <a
                className="font-semibold text-forest hover:underline"
                href={`mailto:${contact.email}`}
              >
                {contact.email}
              </a>
            </li>
          ) : null}
          {contact?.business_hours ? (
            <li className="flex gap-3">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-clay" />
              <span>
                {contact.business_hours}
                {contact.timezone ? (
                  <span className="block text-xs text-muted">
                    {contact.timezone}
                  </span>
                ) : null}
              </span>
            </li>
          ) : null}
        </ul>
        {contact?.map_url ? (
          <a
            className="mt-4 inline-flex text-sm font-semibold text-forest underline"
            href={contact.map_url}
            target="_blank"
            rel="noreferrer noopener"
          >
            View location map
          </a>
        ) : null}
      </div>

      {contact?.service_area ? (
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-sm font-semibold text-ink">Service area</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {contact.service_area}
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">Project enquiries</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Include the location, building type, current stage and priorities. The
          team can then respond with the right next step rather than a generic
          sales reply.
        </p>
        {enquiry?.response_window ? (
          <p className="mt-3 text-sm font-semibold text-forest">
            Expected first response: {enquiry.response_window}
          </p>
        ) : null}
      </div>

      <p className="text-xs leading-5 text-muted">
        Do not send passwords, payment details or confidential documents through
        this form. If documents are needed, the team will arrange an appropriate
        route.
      </p>
    </div>
  );
}
