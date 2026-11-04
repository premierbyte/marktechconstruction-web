"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  Compass,
  FileText,
  Image as ImageIcon,
  Palette,
  Phone,
  Plus,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  getEditorAt,
  runWorkflowAt,
  saveDraftAt,
  type MediaAsset,
} from "@/features/admin/shared/api";
import {
  AdminCard,
  ErrorBanner,
  Field,
  inputClass,
  Notice,
  PageHeader,
  Spinner,
} from "@/features/admin/shared/components/ui";
import { MediaPicker } from "@/features/admin/shared/components/MediaPicker";

const SETTINGS_URL = "/api/v1/admin/settings";

const TABS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "enquiry", label: "Enquiry", icon: FileText },
  { id: "social", label: "Social", icon: Share2 },
  { id: "navigation", label: "Navigation", icon: Compass },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Obj = Record<string, unknown>;

function get(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (carry, key) =>
        carry && typeof carry === "object" ? (carry as Obj)[key] : undefined,
      source,
    );
}

function set(source: Obj, path: string, value: unknown): Obj {
  const keys = path.split(".");
  const clone: Obj = { ...source };
  let cursor: Obj = clone;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    const next = cursor[key];
    cursor[key] = next && typeof next === "object" ? { ...(next as Obj) } : {};
    cursor = cursor[key] as Obj;
  });

  return clone;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => asString(item)) : [];
}

function asPairList(value: unknown): { label: string; href: string }[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = (item ?? {}) as Obj;
    return { label: asString(row.label), href: asString(row.href) };
  });
}

export function SettingsManager() {
  const query = useQuery({
    queryKey: ["admin", "settings", "editor"],
    queryFn: () => getEditorAt(SETTINGS_URL),
  });

  if (query.isLoading) return <Spinner label="Loading settings" />;
  if (query.isError || !query.data) {
    return (
      <ErrorBanner
        message="Settings could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <SettingsForm
      key={query.data.current_version}
      initialPayload={(query.data.payload ?? {}) as Obj}
      initialVersion={query.data.current_version}
    />
  );
}

function SettingsForm({
  initialPayload,
  initialVersion,
}: {
  initialPayload: Obj;
  initialVersion: number;
}) {
  const [values, setValues] = useState<Obj>(structuredClone(initialPayload));
  const [version, setVersion] = useState(initialVersion);
  const [active, setActive] = useState<TabId>("company");
  const [picker, setPicker] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const update = (path: string, value: unknown) =>
    setValues((current) => set(current, path, value));

  const save = useMutation({
    mutationFn: async (publish: boolean) => {
      const state = await saveDraftAt(SETTINGS_URL, values, version);
      setVersion(state.current_version);
      setValues((state.payload as Obj | null) ?? values);

      if (publish) {
        await runWorkflowAt(SETTINGS_URL, "submit-review");
        await runWorkflowAt(SETTINGS_URL, "approve");
        await runWorkflowAt(SETTINGS_URL, "publish");
      }
      return state;
    },
    onSuccess: (_state, publish) =>
      setMessage(
        publish
          ? "Settings saved and published."
          : "Settings saved as a draft.",
      ),
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Save failed."),
  });

  const onPick = (asset: MediaAsset) => {
    if (!picker) return;
    update(picker, {
      asset_id: asset.id,
      url: asset.url ?? undefined,
      alt: asset.alt_text,
    });
  };

  const logo = get(values, "branding.logo") as Obj | null;
  const favicon = get(values, "branding.favicon") as Obj | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site settings"
        description="Company details, branding, contact information and enquiry configuration."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={save.isPending}
              onClick={() => save.mutate(false)}
            >
              Save draft
            </Button>
            <Button
              type="button"
              disabled={save.isPending}
              onClick={() => save.mutate(true)}
            >
              {save.isPending ? "Saving..." : "Save & publish"}
            </Button>
          </div>
        }
      />

      {message ? <Notice>{message}</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[230px_1fr] lg:items-start">
        <nav
          aria-label="Settings sections"
          className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const current = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-colors",
                  current
                    ? "bg-forest text-white shadow-sm"
                    : "text-ink/75 hover:bg-forest/5 hover:text-forest",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {active === "company" ? (
            <SettingsSection
              icon={Building2}
              title="Company"
              description="Legal and display identity."
            >
              <Field label="Company name" htmlFor="company-name">
                <input
                  id="company-name"
                  className={inputClass}
                  value={asString(get(values, "company.name"))}
                  onChange={(e) => update("company.name", e.target.value)}
                />
              </Field>
              <Field
                label="Legal name"
                htmlFor="company-legal"
                hint="Registered legal name."
              >
                <input
                  id="company-legal"
                  className={inputClass}
                  value={asString(get(values, "company.legal_name"))}
                  onChange={(e) => update("company.legal_name", e.target.value)}
                />
              </Field>
              <Field label="Tagline" htmlFor="company-tagline">
                <input
                  id="company-tagline"
                  className={inputClass}
                  value={asString(get(values, "company.tagline"))}
                  onChange={(e) => update("company.tagline", e.target.value)}
                />
              </Field>
              <Field label="Description" htmlFor="company-description">
                <textarea
                  id="company-description"
                  rows={5}
                  className={inputClass}
                  value={asString(get(values, "company.description"))}
                  onChange={(e) =>
                    update("company.description", e.target.value)
                  }
                />
              </Field>
            </SettingsSection>
          ) : null}

          {active === "branding" ? (
            <SettingsSection
              icon={Palette}
              title="Branding"
              description="Logo, favicon and brand colours."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaField
                  label="Logo"
                  value={logo}
                  onChoose={() => setPicker("branding.logo")}
                  onClear={() => update("branding.logo", null)}
                />
                <MediaField
                  label="Favicon"
                  value={favicon}
                  onChoose={() => setPicker("branding.favicon")}
                  onClear={() => update("branding.favicon", null)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Primary colour"
                  htmlFor="brand-primary"
                  hint="Hex, e.g. #203090"
                >
                  <input
                    id="brand-primary"
                    className={inputClass}
                    value={asString(get(values, "brand.primary_color"))}
                    onChange={(e) =>
                      update("brand.primary_color", e.target.value)
                    }
                  />
                </Field>
                <Field
                  label="Accent colour"
                  htmlFor="brand-accent"
                  hint="Hex, e.g. #0090D0"
                >
                  <input
                    id="brand-accent"
                    className={inputClass}
                    value={asString(get(values, "brand.accent_color"))}
                    onChange={(e) =>
                      update("brand.accent_color", e.target.value)
                    }
                  />
                </Field>
              </div>
            </SettingsSection>
          ) : null}

          {active === "contact" ? (
            <SettingsSection
              icon={Phone}
              title="Contact"
              description="How clients reach the company."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="contact-email">
                  <input
                    id="contact-email"
                    className={inputClass}
                    value={asString(get(values, "contact.email"))}
                    onChange={(e) => update("contact.email", e.target.value)}
                  />
                </Field>
                <Field label="Phone" htmlFor="contact-phone">
                  <input
                    id="contact-phone"
                    className={inputClass}
                    value={asString(get(values, "contact.phone"))}
                    onChange={(e) => update("contact.phone", e.target.value)}
                  />
                </Field>
              </div>
              <StringList
                label="Address lines"
                values={asStringList(get(values, "contact.address_lines"))}
                onChange={(next) => update("contact.address_lines", next)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" htmlFor="contact-city">
                  <input
                    id="contact-city"
                    className={inputClass}
                    value={asString(get(values, "contact.city"))}
                    onChange={(e) => update("contact.city", e.target.value)}
                  />
                </Field>
                <Field label="Region / State" htmlFor="contact-region">
                  <input
                    id="contact-region"
                    className={inputClass}
                    value={asString(get(values, "contact.region"))}
                    onChange={(e) => update("contact.region", e.target.value)}
                  />
                </Field>
                <Field label="Postal code" htmlFor="contact-postal">
                  <input
                    id="contact-postal"
                    className={inputClass}
                    value={asString(get(values, "contact.postal_code"))}
                    onChange={(e) =>
                      update("contact.postal_code", e.target.value)
                    }
                  />
                </Field>
                <Field label="Country" htmlFor="contact-country">
                  <input
                    id="contact-country"
                    className={inputClass}
                    value={asString(get(values, "contact.country"))}
                    onChange={(e) => update("contact.country", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Service area" htmlFor="contact-service-area">
                <input
                  id="contact-service-area"
                  className={inputClass}
                  value={asString(get(values, "contact.service_area"))}
                  onChange={(e) =>
                    update("contact.service_area", e.target.value)
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business hours" htmlFor="contact-hours">
                  <input
                    id="contact-hours"
                    className={inputClass}
                    value={asString(get(values, "contact.business_hours"))}
                    onChange={(e) =>
                      update("contact.business_hours", e.target.value)
                    }
                  />
                </Field>
                <Field label="Timezone" htmlFor="contact-timezone">
                  <input
                    id="contact-timezone"
                    className={inputClass}
                    placeholder="Africa/Lagos"
                    value={asString(get(values, "contact.timezone"))}
                    onChange={(e) => update("contact.timezone", e.target.value)}
                  />
                </Field>
              </div>
              <Field
                label="Map URL"
                htmlFor="contact-map"
                hint="Google Maps share link."
              >
                <input
                  id="contact-map"
                  className={inputClass}
                  value={asString(get(values, "contact.map_url"))}
                  onChange={(e) => update("contact.map_url", e.target.value)}
                />
              </Field>
            </SettingsSection>
          ) : null}

          {active === "enquiry" ? (
            <SettingsSection
              icon={FileText}
              title="Enquiry"
              description="Response wording and enquiry options."
            >
              <Field label="Response window" htmlFor="enquiry-window">
                <input
                  id="enquiry-window"
                  className={inputClass}
                  value={asString(get(values, "enquiry.response_window"))}
                  onChange={(e) =>
                    update("enquiry.response_window", e.target.value)
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Privacy version"
                  htmlFor="enquiry-privacy-version"
                >
                  <input
                    id="enquiry-privacy-version"
                    className={inputClass}
                    value={asString(get(values, "enquiry.privacy_version"))}
                    onChange={(e) =>
                      update("enquiry.privacy_version", e.target.value)
                    }
                  />
                </Field>
                <Field
                  label="Privacy notice slug"
                  htmlFor="enquiry-privacy-slug"
                >
                  <input
                    id="enquiry-privacy-slug"
                    className={inputClass}
                    value={asString(get(values, "enquiry.privacy_notice_slug"))}
                    onChange={(e) =>
                      update("enquiry.privacy_notice_slug", e.target.value)
                    }
                  />
                </Field>
              </div>
              <StringList
                label="Budget bands"
                values={asStringList(get(values, "enquiry.budget_bands"))}
                onChange={(next) => update("enquiry.budget_bands", next)}
              />
              <StringList
                label="Start periods"
                values={asStringList(get(values, "enquiry.start_periods"))}
                onChange={(next) => update("enquiry.start_periods", next)}
              />
            </SettingsSection>
          ) : null}

          {active === "social" ? (
            <SettingsSection
              icon={Share2}
              title="Social links"
              description="Profiles shown in the footer."
            >
              <PairList
                label="Links"
                values={asPairList(get(values, "social"))}
                onChange={(next) => update("social", next)}
              />
            </SettingsSection>
          ) : null}

          {active === "navigation" ? (
            <SettingsSection
              icon={Compass}
              title="Navigation"
              description="Primary menu items."
            >
              <PairList
                label="Menu items"
                values={asPairList(get(values, "navigation"))}
                onChange={(next) => update("navigation", next)}
              />
            </SettingsSection>
          ) : null}
        </div>
      </div>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={onPick}
      />
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <AdminCard className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest">
          <Icon aria-hidden className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </AdminCard>
  );
}

function MediaField({
  label,
  value,
  onChoose,
  onClear,
}: {
  label: string;
  value: Obj | null;
  onChoose: () => void;
  onClear: () => void;
}) {
  const url = typeof value?.url === "string" ? value.url : null;

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink">{label}</p>
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="size-12 rounded-lg border border-line bg-white object-contain p-1"
          />
        ) : (
          <span className="grid size-12 place-items-center rounded-lg bg-mist text-muted">
            <ImageIcon aria-hidden className="size-4" />
          </span>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={onChoose}>
          Choose
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!url}
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function StringList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink">{label}</p>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              aria-label={`${label} item ${index + 1}`}
              className={inputClass}
              value={value}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...values, ""])}
        >
          <Plus aria-hidden className="size-4" /> Add
        </Button>
      </div>
    </div>
  );
}

function PairList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: { label: string; href: string }[];
  onChange: (values: { label: string; href: string }[]) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink">{label}</p>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <input
              aria-label={`Label ${index + 1}`}
              className={`${inputClass} flex-1`}
              placeholder="Label"
              value={value.label}
              onChange={(event) => {
                const next = [...values];
                next[index] = { ...next[index], label: event.target.value };
                onChange(next);
              }}
            />
            <input
              aria-label={`Link ${index + 1}`}
              className={`${inputClass} flex-1`}
              placeholder="/path"
              value={value.href}
              onChange={(event) => {
                const next = [...values];
                next[index] = { ...next[index], href: event.target.value };
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange([...values, { label: "", href: "" }])}
        >
          <Plus aria-hidden className="size-4" /> Add
        </Button>
      </div>
    </div>
  );
}
