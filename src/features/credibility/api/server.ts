import { publicFetch } from "@/lib/seo";
import type { Credential, Testimonial } from "../types";

type ListResponse<T> = { data: T[] };

export async function getTestimonials(): Promise<Testimonial[]> {
  const response = await publicFetch<ListResponse<Testimonial>>(
    "/public/testimonials",
    {
      revalidate: 60,
      tags: ["credentials", "public-content"],
    },
  );

  return response?.data ?? [];
}

export async function getCredentials(): Promise<Credential[]> {
  const response = await publicFetch<ListResponse<Credential>>(
    "/public/credentials",
    {
      revalidate: 60,
      tags: ["credentials", "public-content"],
    },
  );

  return response?.data ?? [];
}
