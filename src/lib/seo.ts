import type { Metadata } from "next";

const API_BASE = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8000";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export async function publicFetch<T>(
  path: string,
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}/api/v1${path}`, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: options.revalidate ?? 60,
        tags: options.tags ?? [],
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export type SeoImage = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type PageMetadataInput = {
  title: string;
  description?: string | null;
  path: string;
  image?: string | SeoImage | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
};

function normaliseImage(image: PageMetadataInput["image"]): SeoImage | null {
  if (!image) return null;

  const value = typeof image === "string" ? { url: image } : image;

  if (!value.url) return null;

  return { ...value, url: absoluteUrl(value.url) };
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  noIndex,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const resolvedDescription = description?.trim() || undefined;
  const resolvedImage = normaliseImage(image);

  return {
    title,
    description: resolvedDescription,
    alternates: { canonical: url },
    keywords: keywords && keywords.length > 0 ? keywords : undefined,
    authors: authors && authors.length > 0 ? authors.map((name) => ({ name })) : undefined,
    openGraph: {
      title,
      description: resolvedDescription,
      url,
      locale: "en",
      type,
      ...(resolvedImage
        ? {
            images: [
              {
                url: resolvedImage.url,
                alt: resolvedImage.alt,
                width: resolvedImage.width,
                height: resolvedImage.height,
              },
            ],
          }
        : {}),
      ...(type === "article" && publishedTime
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      ...(resolvedImage ? { images: [resolvedImage.url] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}