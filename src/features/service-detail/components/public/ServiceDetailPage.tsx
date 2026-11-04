import { notFound } from "next/navigation";
import { CapabilityDetail, getCapability } from "@/features/capabilities";
import { getProjects } from "@/features/projects";

export async function ServiceDetailPage({ slug }: { slug: string }) {
  const [service, projects] = await Promise.all([
    getCapability("service", slug),
    getProjects({ service: slug, per_page: 4 }),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <CapabilityDetail
      capability={service}
      kind="service"
      relatedProjects={projects?.data ?? []}
    />
  );
}
