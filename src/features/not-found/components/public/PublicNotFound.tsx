import Link from "next/link";
import { Container, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { DEFAULT_NAVIGATION } from "@/features/settings";

export function PublicNotFound() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          404
        </p>
        <h1 className="display mt-4 text-4xl leading-tight text-ink sm:text-5xl">
          That page could not be found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">
          The page may have moved, been unpublished, or the address may be
          mistyped. Use the links below to continue.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Return home</ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            View projects
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact
          </ButtonLink>
        </div>
        <nav
          aria-label="Site sections"
          className="mt-10 border-t border-line pt-6"
        >
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {DEFAULT_NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  className="font-semibold text-forest hover:underline"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </Section>
  );
}
