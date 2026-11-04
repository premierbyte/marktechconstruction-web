"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Award, BadgeCheck, Building2, CalendarClock, Expand, X } from "lucide-react";
import { Container, Eyebrow } from "@/components/layout/Section";
import type { Credential } from "../../types";

function formatDate(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function CredentialCard({
  credential,
  onOpen,
}: {
  credential: Credential;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const expires = formatDate(credential.expires_on);
  const reviewed = formatDate(credential.review_on);
  const hasPreview = Boolean(credential.media?.url);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-clay/40 hover:bg-white/[0.08]">
      {credential.media?.url ? (
        <button
          type="button"
          onClick={(event) => onOpen(event.currentTarget)}
          aria-label={`Preview ${credential.name} certificate`}
          className="relative block h-32 w-full overflow-hidden bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
        >
          <Image
            src={credential.media.url}
            alt={credential.media.alt || `${credential.name} certificate`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <span className="pointer-events-none absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-ink/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <Expand aria-hidden className="size-4" />
          </span>
        </button>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-clay/15 text-clay transition-colors group-hover:bg-clay group-hover:text-white">
            {hasPreview ? (
              <Award aria-hidden className="size-5" />
            ) : (
              <BadgeCheck aria-hidden className="size-5" />
            )}
          </span>
          {expires ? (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/60">
              Valid until {expires}
            </span>
          ) : null}
        </div>

        <h3 className="display mt-5 text-xl leading-tight text-white">
          {credential.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-clay">{credential.issuer}</p>

        {credential.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">
            {credential.summary}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-xs text-white/50">
          {credential.applicable_entity ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 aria-hidden className="size-3.5" />
              {credential.applicable_entity}
            </span>
          ) : null}
          {reviewed ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock aria-hidden className="size-3.5" />
              Reviewed {reviewed}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CredentialsShowcase({
  credentials,
}: {
  credentials: Credential[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setActive(null);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (active === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, close]);

  if (credentials.length === 0) {
    return null;
  }

  const current = active === null ? null : credentials[active];
  const currentMedia = current?.media;

  return (
    <section className="relative overflow-hidden border-y border-forest/40 bg-forest py-16 sm:py-20">
      <div
        className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-clay/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Certifications &amp; accreditations</Eyebrow>
          <h2 className="display mt-3 text-balance text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
            Credentials that back up the work
          </h2>
          <p className="mt-4 text-base leading-7 text-white/70">
            Current certifications and accreditations, published only when
            verifiable and approved. Expired credentials are removed
            automatically.
          </p>
        </div>

        <div className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          {credentials.map((credential, index) => (
            <div
              key={credential.slug || credential.name}
              className="w-[19rem] shrink-0 snap-start sm:w-[22rem]"
            >
              <CredentialCard
                credential={credential}
                onOpen={(trigger) => {
                  triggerRef.current = trigger;
                  setActive(index);
                }}
              />
            </div>
          ))}
        </div>
      </Container>

      {current && currentMedia?.url ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${current.name} certificate preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close certificate preview"
              className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X aria-hidden className="size-5" />
            </button>

            <Image
              src={currentMedia.url}
              alt={currentMedia.alt || `${current.name} certificate`}
              width={currentMedia.width ?? 900}
              height={currentMedia.height ?? 1200}
              sizes="(max-width: 768px) 100vw, 768px"
              className="mx-auto max-h-[78vh] w-auto rounded-2xl bg-white object-contain shadow-lift"
            />

            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-white">{current.name}</p>
              <p className="mt-1 text-xs text-white/60">{current.issuer}</p>
              {formatDate(current.expires_on) ? (
                <p className="mt-2 text-xs text-white/50">
                  Valid until {formatDate(current.expires_on)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}