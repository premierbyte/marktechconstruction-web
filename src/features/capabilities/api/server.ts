import { publicFetch } from "@/lib/seo";
import type { Capability, CapabilityKind } from "../types";

type ListResponse = { data: Capability[] };
type DetailResponse = { data: Capability };

export async function getCapabilities(kind: CapabilityKind): Promise<Capability[]> {
  const response = await publicFetch<ListResponse>(`/public/${kind}s`, {
    revalidate: 60,
    tags: [kind === "service" ? "services" : "sectors"],
  });

  return response?.data ?? [];
}

export async function getCapability(
  kind: CapabilityKind,
  slug: string,
): Promise<Capability | null> {
  const response = await publicFetch<DetailResponse>(`/public/${kind}s/${slug}`, {
    revalidate: 60,
    tags: [kind === "service" ? "services" : "sectors", `${kind}:${slug}`],
  });

  return response?.data ?? null;
}
