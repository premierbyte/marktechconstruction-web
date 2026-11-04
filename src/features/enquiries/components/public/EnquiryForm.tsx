"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createEnquiryAttempt, submitEnquiry } from "../../api/client";
import { enquirySchema, type EnquiryFormValues } from "../../schemas/enquiry";
import type { EnquiryAttempt, EnquiryReceipt } from "../../types";

type Option = { slug: string; name: string };
type Mode = "project" | "general";

type Props = {
  mode: Mode;
  services: Option[];
  sectors: Option[];
  privacyVersion?: string;
  privacySlug?: string;
  responseWindow?: string;
  budgetBands?: string[];
  startPeriods?: string[];
  defaultService?: string;
  defaultSector?: string;
  compact?: boolean;
};

const inputClass =
  "min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-muted/70 aria-[invalid=true]:border-clay";

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-clay"> *</span> : <span className="ml-1 text-xs font-normal text-muted">(optional)</span>}
      </label>
      {hint ? <p id={`${htmlFor}-hint`} className="mb-1.5 text-xs text-muted">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs font-medium text-clay">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EnquiryForm({
  mode,
  services,
  sectors,
  privacyVersion,
  privacySlug = "privacy",
  responseWindow,
  budgetBands = [],
  startPeriods = [],
  defaultService,
  defaultSector,
  compact = false,
}: Props) {
  const [attempt, setAttempt] = useState<EnquiryAttempt | null>(null);
  const [attemptState, setAttemptState] = useState<"loading" | "ready" | "error">("loading");
  const [attemptMessage, setAttemptMessage] = useState<string | null>(null);
  const [submissionKey, setSubmissionKey] = useState<string>(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<EnquiryReceipt | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const defaults = useMemo<EnquiryFormValues>(
    () => ({
      type: mode,
      contact_name: "",
      email: "",
      phone: "",
      preferred_contact: "email",
      organization: "",
      subject: "",
      service_slug: defaultService && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(defaultService) ? defaultService : "",
      service_label: "",
      sector_slug: defaultSector && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(defaultSector) ? defaultSector : "",
      sector_label: "",
      project_location: "",
      brief: "",
      budget_band: "",
      start_period: "",
      privacy_acknowledged: false,
      company_website: "",
    }),
    [defaultSector, defaultService, mode],
  );

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    control,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const brief = useWatch({ control, name: "brief" }) ?? "";

  const prepareAttempt = useCallback(async (): Promise<EnquiryAttempt> => {
    try {
      const next = await createEnquiryAttempt();
      setAttempt(next);
      setAttemptState("ready");
      return next;
    } catch (error) {
      setAttemptState("error");
      setAttemptMessage(error instanceof Error ? error.message : "The enquiry form could not be prepared.");
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) {
        void prepareAttempt().catch(() => undefined);
      }
    });

    return () => {
      active = false;
    };
  }, [prepareAttempt]);

  useEffect(() => {
    if (showSummary) {
      summaryRef.current?.focus();
    }
  }, [showSummary]);

  const startAnother = useCallback(() => {
    setReceipt(null);
    setFormError(null);
    setShowSummary(false);
    setAttemptState("loading");
    reset(defaults);
    setSubmissionKey(crypto.randomUUID());
    void prepareAttempt().catch(() => undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [defaults, prepareAttempt, reset]);

  const onInvalid = () => {
    setShowSummary(true);
    const first = Object.keys(errors)[0] as keyof EnquiryFormValues | undefined;

    if (first) {
      setFocus(first);
    }
  };

  const onValid = async (values: EnquiryFormValues) => {
    setFormError(null);

    if (!privacyVersion) {
      setFormError("The privacy notice is not configured, so enquiries cannot be submitted yet.");
      return;
    }

    setSubmitting(true);

    try {
      let activeAttempt = attempt;

      if (!activeAttempt) {
        setAttemptState("loading");
        activeAttempt = await prepareAttempt();
      }

      const serviceOption = services.find((service) => service.slug === values.service_slug);
      const sectorOption = sectors.find((sector) => sector.slug === values.sector_slug);
      const serviceLabel =
        values.service_slug === "not-sure-yet"
          ? "Not sure yet"
          : serviceOption?.name || values.service_label || undefined;

      const payload = {
        attempt_token: activeAttempt.attempt_token,
        submission_key: submissionKey,
        type: mode,
        contact_name: values.contact_name,
        email: values.email || null,
        phone: values.phone || null,
        preferred_contact: values.preferred_contact,
        organization: values.organization || null,
        subject: mode === "general" ? values.subject : null,
        service_slug: mode === "project" ? values.service_slug : null,
        service_label: mode === "project" ? serviceLabel : null,
        sector_slug: values.sector_slug || null,
        sector_label: sectorOption?.name || values.sector_label || null,
        project_location: mode === "project" ? values.project_location : null,
        brief: values.brief,
        budget_band: values.budget_band || null,
        start_period: values.start_period || null,
        privacy_version: privacyVersion,
        privacy_acknowledged: values.privacy_acknowledged,
        source_page: window.location.pathname + window.location.search,
        company_website: values.company_website || "",
      };

      const result = await submitEnquiry(payload);

      if (result.ok) {
        setReceipt(result.receipt);
        setShowSummary(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (result.status === 422 && result.errors) {
        const known = Object.keys(result.errors);

        known.forEach((key) => {
          const message = result.errors?.[key]?.[0];

          if (message && key in defaults) {
            setError(key as keyof EnquiryFormValues, { type: "server", message });
          }
        });

        if (known.includes("attempt_token")) {
          setFormError("The form session was refreshed. Check the highlighted fields and submit again.");
          setAttempt(null);
          void prepareAttempt().catch(() => undefined);
        } else {
          setFormError(result.message);
        }

        setShowSummary(true);
        return;
      }

      if (result.status === 409) {
        setFormError(
          "This submission key was already used with different information. A new form session has been prepared; review your details and submit again.",
        );
        setSubmissionKey(crypto.randomUUID());
        void prepareAttempt().catch(() => undefined);
        return;
      }

      if (result.status === 429) {
        setFormError(
          "Too many attempts have been made from this connection. Wait a few minutes and try again, or use the contact details on this page.",
        );
        return;
      }

      setFormError(result.message);
    } catch {
      setFormError(
        "The connection was interrupted. Your details remain in the form. Retry when the connection is restored — an accepted enquiry will return the same reference.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (receipt) {
    return (
      <div className="rounded-3xl border border-forest/15 bg-white p-6 shadow-card sm:p-8" role="status">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-forest text-white">
            <CheckCircle2 aria-hidden className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Enquiry received</p>
            <h2 className="display mt-2 text-3xl text-ink">Thank you. Your enquiry is stored.</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              The team has not yet reviewed the enquiry. Keep the reference below for any follow-up.
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 rounded-2xl bg-sand p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Reference</dt>
            <dd className="mt-1 text-lg font-bold tracking-wide text-ink">{receipt.reference}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Received</dt>
            <dd className="mt-1 font-semibold text-ink">
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(receipt.received_at))}
            </dd>
          </div>
          {receipt.expected_response_window ?? responseWindow ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Expected response</dt>
              <dd className="mt-1 text-ink">{receipt.expected_response_window ?? responseWindow}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-5 text-sm leading-6 text-muted">
          If you need to share documents, reply to the receipt email or mention it when the team makes contact.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={startAnother} variant="secondary">
            Submit another enquiry
          </Button>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-forest hover:bg-forest/5">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  const errorEntries = Object.entries(errors).filter(
    ([key, value]) => key !== "company_website" && Boolean(value?.message),
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid, onInvalid)}
      className={cn("rounded-3xl border border-line bg-white p-5 shadow-card sm:p-8", compact && "sm:p-6")}
    >
      {showSummary && (errorEntries.length > 0 || formError) ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-xl border border-clay/40 bg-clay/5 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-clay" />
            <div>
              <p className="text-sm font-semibold text-ink">Check the form before submitting</p>
              {formError ? <p className="mt-1 text-sm leading-6 text-muted">{formError}</p> : null}
              {errorEntries.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-clay">
                  {errorEntries.map(([key, value]) => (
                    <li key={key}>
                      <a className="underline" href={`#field-${key}`}>
                        {String(value?.message)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {formError && !showSummary ? (
        <div role="alert" className="mb-6 rounded-xl border border-clay/40 bg-clay/5 p-4 text-sm leading-6 text-ink">
          {formError}
        </div>
      ) : null}

      {!privacyVersion ? (
        <div className="mb-6 rounded-xl border border-clay/40 bg-clay/5 p-4 text-sm leading-6 text-ink">
          The privacy notice has not been configured, so online enquiries are temporarily unavailable. Please use the
          contact details on this page.
        </div>
      ) : null}

      {attemptState === "error" ? (
        <div className="mb-6 rounded-xl border border-clay/40 bg-clay/5 p-4 text-sm leading-6 text-ink">
          <p>{attemptMessage}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => void prepareAttempt().catch(() => undefined)}
          >
            <RefreshCw aria-hidden className="size-4" /> Retry form setup
          </Button>
        </div>
      ) : null}

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
          {mode === "project" ? "Project enquiry" : "General enquiry"}
        </legend>

        <Field label="Your name" htmlFor="field-contact_name" required error={errors.contact_name?.message}>
          <input
            id="field-contact_name"
            autoComplete="name"
            className={inputClass}
            aria-invalid={Boolean(errors.contact_name)}
            aria-describedby={errors.contact_name ? "field-contact_name-error" : undefined}
            {...register("contact_name")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Email address"
            htmlFor="field-email"
            required
            error={errors.email?.message}
            hint="International formats accepted."
          >
            <input
              id="field-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className={inputClass}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "field-email-error" : "field-email-hint"}
              {...register("email")}
            />
          </Field>
          <Field label="Telephone" htmlFor="field-phone" error={errors.phone?.message} hint="Include the country code.">
            <input
              id="field-phone"
              type="tel"
              autoComplete="tel"
              className={inputClass}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "field-phone-error" : "field-phone-hint"}
              {...register("phone")}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-ink">
            Preferred contact method <span className="text-clay">*</span>
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-5">
            {(["email", "phone"] as const).map((method) => (
              <label key={method} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 text-sm">
                <input type="radio" value={method} {...register("preferred_contact")} />
                {method === "email" ? "Email" : "Telephone"}
              </label>
            ))}
          </div>
          {errors.preferred_contact?.message ? (
            <p className="mt-1.5 text-xs font-medium text-clay">{errors.preferred_contact.message}</p>
          ) : null}
        </fieldset>

        <Field label="Organization" htmlFor="field-organization" error={errors.organization?.message}>
          <input
            id="field-organization"
            autoComplete="organization"
            className={inputClass}
            {...register("organization")}
          />
        </Field>

        {mode === "project" ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Service or project type" htmlFor="field-service_slug" required error={errors.service_slug?.message}>
                <select
                  id="field-service_slug"
                  className={inputClass}
                  aria-invalid={Boolean(errors.service_slug)}
                  {...register("service_slug")}
                >
                  <option value="">Choose a service</option>
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                  <option value="not-sure-yet">Not sure yet</option>
                </select>
              </Field>
              <Field label="Sector" htmlFor="field-sector_slug" error={errors.sector_slug?.message}>
                <select id="field-sector_slug" className={inputClass} {...register("sector_slug")}>
                  <option value="">Choose a sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.slug} value={sector.slug}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Project location"
              htmlFor="field-project_location"
              required
              error={errors.project_location?.message}
              hint="City or region. Do not include a full private address."
            >
              <input
                id="field-project_location"
                className={inputClass}
                aria-invalid={Boolean(errors.project_location)}
                {...register("project_location")}
              />
            </Field>

            {budgetBands.length > 0 || startPeriods.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {budgetBands.length > 0 ? (
                  <Field label="Indicative budget" htmlFor="field-budget_band" error={errors.budget_band?.message}>
                    <select id="field-budget_band" className={inputClass} {...register("budget_band")}>
                      <option value="">Prefer not to say</option>
                      {budgetBands.map((band) => (
                        <option key={band} value={band}>
                          {band}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
                {startPeriods.length > 0 ? (
                  <Field label="Desired start" htmlFor="field-start_period" error={errors.start_period?.message}>
                    <select id="field-start_period" className={inputClass} {...register("start_period")}>
                      <option value="">Not sure yet</option>
                      {startPeriods.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <Field label="Subject" htmlFor="field-subject" required error={errors.subject?.message}>
            <input
              id="field-subject"
              className={inputClass}
              aria-invalid={Boolean(errors.subject)}
              {...register("subject")}
            />
          </Field>
        )}

        <Field
          label={mode === "project" ? "Project brief" : "Message"}
          htmlFor="field-brief"
          required
          error={errors.brief?.message}
          hint="Between 30 and 5,000 characters."
        >
          <textarea
            id="field-brief"
            rows={mode === "project" ? 7 : 5}
            maxLength={5000}
            className={cn(inputClass, "min-h-32 py-3")}
            aria-invalid={Boolean(errors.brief)}
            {...register("brief")}
          />
          <p className="mt-1 text-right text-xs text-muted">{brief.length} / 5,000</p>
        </Field>

        <div className="rounded-xl bg-mist p-4 text-sm leading-6 text-ink">
          <strong className="font-semibold">Attachments:</strong> secure uploads are being enabled separately. If you
          need to share drawings or documents, mention this in your brief and the team will arrange a safe route.
        </div>

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="field-company_website">Company website</label>
          <input
            id="field-company_website"
            tabIndex={-1}
            autoComplete="off"
            {...register("company_website")}
          />
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm leading-6 text-ink">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-line"
              aria-invalid={Boolean(errors.privacy_acknowledged)}
              {...register("privacy_acknowledged")}
            />
            <span>
              I acknowledge that my details will be used to respond to this enquiry, as described in the{" "}
              <Link className="font-semibold text-forest underline" href={`/policies/${privacySlug}`} target="_blank">
                privacy notice
              </Link>
              . <span className="text-clay">*</span>
            </span>
          </label>
          {errors.privacy_acknowledged?.message ? (
            <p className="mt-1.5 text-xs font-medium text-clay">{errors.privacy_acknowledged.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-5 text-muted">
            An enquiry does not reserve capacity, create a contract or guarantee a price.
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={submitting || attemptState === "loading" || !privacyVersion}
            className="shrink-0"
          >
            {submitting ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" /> Sending enquiry
              </>
            ) : attemptState === "loading" ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" /> Preparing form
              </>
            ) : (
              <>
                Send enquiry <ArrowRight aria-hidden className="size-4" />
              </>
            )}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
