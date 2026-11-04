import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { InsightsGrid, type Insight } from "@/features/insights";

export function InsightsSection({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Section tone="sand">
      <Container>
        <SectionHeading
          eyebrow="Insights"
          title="Ideas for building better"
          intro="Practical notes on planning, building and maintaining construction projects."
          action={
            <ButtonLink href="/insights" variant="secondary" size="sm">
              All insights
            </ButtonLink>
          }
        />
        <div className="mt-10">
          <InsightsGrid insights={insights.slice(0, 3)} featuredFirst={false} />
        </div>
      </Container>
    </Section>
  );
}
