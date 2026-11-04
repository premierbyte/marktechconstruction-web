import type { Project } from "@/features/projects";

type GalleryImage = NonNullable<Project["gallery"]>[number];

export function ProjectGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="display text-3xl text-ink">Project gallery</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {images.map((image, index) =>
          image.url ? (
            <figure
              key={`${image.url}-${index}`}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || ""}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              {image.caption || image.credit ? (
                <figcaption className="p-3 text-xs text-muted">
                  {image.caption}
                  {image.credit ? ` — ${image.credit}` : ""}
                </figcaption>
              ) : null}
            </figure>
          ) : null,
        )}
      </div>
    </section>
  );
}
