import Link from "next/link";
import { headingId } from "../../utils/headings";

export function PolicyAside({
  headings,
  demo,
}: {
  headings: string[];
  demo?: boolean;
}) {
  return (
    <aside className="space-y-4">
      {demo ? (
        <div className="rounded-xl border border-clay/30 bg-clay/5 p-4 text-sm leading-6 text-ink">
          Demonstration policy content. It is not approved legal wording and must
          be reviewed before launch.
        </div>
      ) : null}
      {headings.length > 0 ? (
        <nav
          aria-label="On this page"
          className="rounded-2xl border border-line bg-white p-5"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            On this page
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {headings.map((heading) => (
              <li key={heading}>
                <a
                  className="text-forest hover:underline"
                  href={`#${headingId(heading)}`}
                >
                  {heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <div className="rounded-2xl border border-line bg-white p-5 text-sm leading-6 text-muted">
        Questions about this notice can be raised through the{" "}
        <Link className="font-semibold text-forest underline" href="/contact">
          contact page
        </Link>
        .
      </div>
    </aside>
  );
}
