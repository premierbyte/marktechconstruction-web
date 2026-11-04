import Image from "next/image";
import { Container, Section, SectionHeading } from "@/components/layout/Section";
import { Prose } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { getTeamPage } from "../../api/server";
import { initials, parseTeamMembers } from "../../utils/members";

type DisplayMember = {
  name: string;
  role: string;
  avatarUrl?: string | null;
  avatarAlt?: string | null;
};

export async function TeamPage() {
  const page = await getTeamPage();

  const members: DisplayMember[] =
    page?.members && page.members.length > 0
      ? page.members.map((member) => ({
          name: member.name,
          role: member.role ?? "",
          avatarUrl: member.avatar?.url ?? null,
          avatarAlt: member.avatar?.alt ?? null,
        }))
      : parseTeamMembers(page?.body);

  return (
    <>
      <section className="border-b border-line bg-sand">
        <Container className="py-16 sm:py-20 lg:py-24">
          <SectionHeading
            eyebrow="Our people"
            title={page?.title || "Our Team"}
            intro={
              page?.summary ||
              "The management and project team behind Marktech Construction Nigeria Limited."
            }
            as="h1"
          />
        </Container>
      </section>

      <Section>
        <Container>
          {members.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <article
                  key={member.name}
                  className="flex flex-col items-center rounded-2xl border border-line bg-white p-6 text-center shadow-card"
                >
                  {member.avatarUrl ? (
                    <Image
                      src={member.avatarUrl}
                      alt={member.avatarAlt || member.name}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="size-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-16 place-items-center rounded-full bg-forest text-lg font-semibold text-white">
                      {initials(member.name) || "•"}
                    </span>
                  )}
                  <h2 className="display mt-4 text-xl leading-tight text-ink">
                    {member.name}
                  </h2>
                  {member.role ? (
                    <p className="mt-1 text-sm font-medium text-clay">
                      {member.role}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : page?.body ? (
            <Prose text={page.body} className="max-w-none" />
          ) : null}
        </Container>
      </Section>

      <Section tone="white">
        <Container className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="display text-2xl text-ink">Work with the team</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
              Share your project brief and location. The team will explain the
              next step and whether Marktech is the right fit for the work.
            </p>
          </div>
          <ButtonLink href="/discuss-your-project">
            Discuss your project
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}