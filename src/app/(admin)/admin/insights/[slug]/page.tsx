import { ResourceEditor } from "@/features/admin/shared/components/ResourceEditor";
import { resources } from "@/features/admin/shared/resources";

export default async function AdminInsightEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResourceEditor config={resources.insights} slug={slug} />;
}
