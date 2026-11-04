import { z } from "zod";

const phonePattern = /^\+?[0-9][0-9 ()\-]{5,24}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const enquirySchema = z
  .object({
    type: z.enum(["project", "general"]),
    contact_name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(160, "Use 160 characters or fewer."),
    email: z.string().trim().max(254).optional(),
    phone: z.string().trim().max(40).optional(),
    preferred_contact: z.enum(["email", "phone"], {
      message: "Choose how you would prefer to be contacted.",
    }),
    organization: z.string().trim().max(200).optional(),
    subject: z.string().trim().max(200).optional(),
    service_slug: z.string().trim().max(160).optional(),
    service_label: z.string().trim().max(200).optional(),
    sector_slug: z.string().trim().max(160).optional(),
    sector_label: z.string().trim().max(200).optional(),
    project_location: z.string().trim().max(200).optional(),
    brief: z
      .string()
      .trim()
      .min(30, "Provide at least 30 characters so the team can understand the request.")
      .max(5000, "Use 5,000 characters or fewer."),
    budget_band: z.string().trim().max(80).optional(),
    start_period: z.string().trim().max(80).optional(),
    privacy_acknowledged: z
      .boolean()
      .refine((value) => value, "Acknowledge the privacy notice to continue."),
    company_website: z.string().max(0, "Leave this field empty.").optional(),
  })
  .superRefine((data, context) => {
    if (!data.email && !data.phone) {
      context.addIssue({
        code: "custom",
        message: "Provide an email address or telephone number.",
        path: ["email"],
      });
    }

    if (data.email && !z.string().email().safeParse(data.email).success) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid email address.",
        path: ["email"],
      });
    }

    if (data.phone && !phonePattern.test(data.phone)) {
      context.addIssue({
        code: "custom",
        message: "Enter a telephone number using digits and standard separators.",
        path: ["phone"],
      });
    }

    if (data.preferred_contact === "email" && !data.email) {
      context.addIssue({
        code: "custom",
        message: "An email address is required for your preferred contact method.",
        path: ["email"],
      });
    }

    if (data.preferred_contact === "phone" && !data.phone) {
      context.addIssue({
        code: "custom",
        message: "A telephone number is required for your preferred contact method.",
        path: ["phone"],
      });
    }

    if (data.type === "project" && !data.service_slug) {
      context.addIssue({
        code: "custom",
        message: "Choose a service or select “Not sure yet”.",
        path: ["service_slug"],
      });
    }

    if (data.type === "project" && !data.project_location) {
      context.addIssue({
        code: "custom",
        message: "Provide a city or region for the project.",
        path: ["project_location"],
      });
    }

    if (data.type === "general" && (!data.subject || data.subject.length < 3)) {
      context.addIssue({
        code: "custom",
        message: "Provide a short subject.",
        path: ["subject"],
      });
    }

    if (data.service_slug && !slugPattern.test(data.service_slug)) {
      context.addIssue({
        code: "custom",
        message: "Choose a valid service.",
        path: ["service_slug"],
      });
    }

    if (data.sector_slug && !slugPattern.test(data.sector_slug)) {
      context.addIssue({
        code: "custom",
        message: "Choose a valid sector.",
        path: ["sector_slug"],
      });
    }
  });

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
