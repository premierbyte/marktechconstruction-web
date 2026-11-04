import { notFound } from "next/navigation";
import { CapabilityDetail, getCapability } from "@/features/capabilities";
import { getProjects } from "@/features/projects";

export async function SectorDetailPage({ slug }: { slug: string }) {
  const [sector, projects] = await Promise.all([
    getCapability("sector", slug),
    getProjects({ sector: slug, per_page: 4 }),
  ]);

  if (!sector) {
    notFound();
  }

  return (
    <CapabilityDetail
      capability={sector}
      kind="sector"
      relatedProjects={projects?.data ?? []}
    />
  );
}
