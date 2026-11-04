"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
import type { HeroSlide } from "@/features/settings";

const SETTINGS_URL = "/api/v1/admin/settings";

type Obj = Record<string, unknown>;

function emptySlide(): HeroSlide {
  return {
    eyebrow: "",
    title: "",
    description: "",
    primary_label: "",
    primary_href: "",
    secondary_label: "",
    secondary_href: "",
    media: null,
  };
}

export function SlidesManager() {
  const query = useQuery({
    queryKey: ["admin", "settings", "editor"],
    queryFn: () => getEditorAt(SETTINGS_URL),
  });

  if (query.isLoading) {
    return <Spinner label="Loading slides" />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorBanner
        message="Slides could not be loaded."
        onRetry={() => query.refetch()}
      />
    );
  }

  const payload = (query.data.payload ?? {}) as Obj;
  const hero = (payload.hero ?? {}) as { slides?: HeroSlide[] };

  return (
    <SlidesEditor
      key={query.data.current_version}
      initialSlides={hero.slides ?? []}
      initialPayload={payload}
      initialVersion={query.data.current_version}
    />
  );
}

function SlidesEditor({
  initialSlides,
  initialPayload,
  initialVersion,
}: {
  initialSlides: HeroSlide[];
  initialPayload: Obj;
  initialVersion: number;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [base, setBase] = useState<Obj>(initialPayload);
  const [version, setVersion] = useState(initialVersion);
  const [picker, setPicker] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (publish: boolean) => {
      const payload = {
        ...base,
        hero: { ...((base.hero as Obj | undefined) ?? {}), slides },
      };

      const state = await saveDraftAt(SETTINGS_URL, payload, version);
      setVersion(state.current_version);
      setBase((state.payload as Obj | null) ?? payload);

      if (publish) {
        await runWorkflowAt(SETTINGS_URL, "submit-review");
        await runWorkflowAt(SETTINGS_URL, "approve");
        await runWorkflowAt(SETTINGS_URL, "publish");
      }

      return state;
    },
    onSuccess: (_state, publish) => {
      setMessage(
        publish ? "Slides saved and published." : "Slides saved as a draft.",
      );
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Save failed."),
  });

  const update = (index: number, patch: Partial<HeroSlide>) => {
    setSlides((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const onPick = (asset: MediaAsset) => {
    if (picker === null) return;
    update(picker, {
      media: {
        asset_id: asset.id,
        url: asset.url ?? undefined,
        alt: asset.alt_text,
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero slides"
        description="Manage the slides shown in the home page hero. Add, edit and remove slides, then save and publish."
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

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <AdminCard key={index} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {slide.media?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.media.url}
                    alt=""
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-16 w-24 place-items-center rounded-lg bg-mist text-xs text-muted">
                    No image
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Slide {index + 1}
                  </p>
                  <p className="text-xs text-muted">
                    {slide.title || "Untitled slide"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPicker(index)}
                >
                  Choose image
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSlides((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 aria-hidden className="size-4" /> Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Eyebrow" htmlFor={`slide-eyebrow-${index}`}>
                <input
                  id={`slide-eyebrow-${index}`}
                  className={inputClass}
                  value={slide.eyebrow ?? ""}
                  onChange={(event) =>
                    update(index, { eyebrow: event.target.value })
                  }
                />
              </Field>
              <Field label="Title" htmlFor={`slide-title-${index}`}>
                <input
                  id={`slide-title-${index}`}
                  className={inputClass}
                  value={slide.title ?? ""}
                  onChange={(event) =>
                    update(index, { title: event.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Field
                  label="Description"
                  htmlFor={`slide-description-${index}`}
                >
                  <textarea
                    id={`slide-description-${index}`}
                    rows={3}
                    className={inputClass}
                    value={slide.description ?? ""}
                    onChange={(event) =>
                      update(index, { description: event.target.value })
                    }
                  />
                </Field>
              </div>
              <Field
                label="Primary button label"
                htmlFor={`slide-primary-label-${index}`}
              >
                <input
                  id={`slide-primary-label-${index}`}
                  className={inputClass}
                  value={slide.primary_label ?? ""}
                  onChange={(event) =>
                    update(index, { primary_label: event.target.value })
                  }
                />
              </Field>
              <Field
                label="Primary button link"
                htmlFor={`slide-primary-href-${index}`}
              >
                <input
                  id={`slide-primary-href-${index}`}
                  className={inputClass}
                  placeholder="/discuss-your-project"
                  value={slide.primary_href ?? ""}
                  onChange={(event) =>
                    update(index, { primary_href: event.target.value })
                  }
                />
              </Field>
              <Field
                label="Secondary button label"
                htmlFor={`slide-secondary-label-${index}`}
              >
                <input
                  id={`slide-secondary-label-${index}`}
                  className={inputClass}
                  value={slide.secondary_label ?? ""}
                  onChange={(event) =>
                    update(index, { secondary_label: event.target.value })
                  }
                />
              </Field>
              <Field
                label="Secondary button link"
                htmlFor={`slide-secondary-href-${index}`}
              >
                <input
                  id={`slide-secondary-href-${index}`}
                  className={inputClass}
                  placeholder="/projects"
                  value={slide.secondary_href ?? ""}
                  onChange={(event) =>
                    update(index, { secondary_href: event.target.value })
                  }
                />
              </Field>
            </div>
          </AdminCard>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setSlides((current) => [...current, emptySlide()])}
      >
        <Plus aria-hidden className="size-4" /> Add slide
      </Button>

      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onSelect={onPick}
      />
    </div>
  );
}