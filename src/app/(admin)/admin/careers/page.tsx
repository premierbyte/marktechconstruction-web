import { ResourceList } from "@/features/admin/shared/components/ResourceList";
import { resources } from "@/features/admin/shared/resources";

export default function AdminCareersPage() {
  return <ResourceList config={resources.careers} />;
}