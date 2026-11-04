import { ResourceEditor } from "@/features/admin/shared/components/ResourceEditor";
import { resources } from "@/features/admin/shared/resources";

export default async function AdminServiceEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceEditor config={resources.services} slug={slug} />;
}
