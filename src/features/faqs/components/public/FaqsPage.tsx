import { Container, Section } from "@/components/layout/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";
import { getFaqsContent } from "../../api/server";
import { FaqGroup } from "./FaqGroup";
import { FaqsCta } from "./FaqsCta";
import { FaqsIntro } from "./FaqsIntro";

export async function FaqsPage() {
  const { groups, faqs } = await getFaqsContent();

  const schemas: Record<string, unknown>[] = [
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "FAQs", path: "/faqs" },
    ]),
  ];

  if (faqs.length > 0) {
    schemas.push(faqSchema(faqs));
  }

  return (
    <>
      <JsonLd data={schemas} />
      <FaqsIntro />
      <Section>
        <Container className="max-w-4xl">
          {groups.length > 0 ? (
            <div className="space-y-12">
              {groups.map(([category, items]) => (
                <FaqGroup key={category} category={category} items={items} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No answers are published yet"
              description="FAQs have not been published for this installation. You can still ask a question directly."
              action={<ButtonLink href="/contact">Contact the team</ButtonLink>}
            />
          )}

          <FaqsCta />
        </Container>
      </Section>
    </>
  );
}
