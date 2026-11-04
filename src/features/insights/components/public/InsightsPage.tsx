import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Primitives";
import { getInsights } from "../../api/server";
import { InsightsGrid } from "./InsightsGrid";

export async function InsightsPage() {
  const insights = await getInsights();

  return (
    <>
      <section className="border-b border-line bg-sand">
        <Container className="py-16 sm:py-20 lg:py-24">
          <SectionHeading
            eyebrow="Insights"
            title="Ideas for building better"
            intro="Practical notes on planning, building and maintaining construction projects in Nigeria."
            as="h1"
          />
        </Container>
      </section>

      <Section>
        <Container>
          {insights.length > 0 ? (
            <InsightsGrid insights={insights} />
          ) : (
            <EmptyState
              title="Insights are being prepared"
              description="New articles will appear here. In the meantime, you can still start a project conversation."
              action={
                <ButtonLink href="/discuss-your-project">
                  Discuss your project
                </ButtonLink>
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}