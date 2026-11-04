import type { Metadata } from "next";
import { getPolicyMetadata, PolicyPage } from "@/features/policies";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;

  return getPolicyMetadata(slug);
}

export default async function Page({ params }: Params) {
  const { slug } = await params;

  return <PolicyPage slug={slug} />;
}
