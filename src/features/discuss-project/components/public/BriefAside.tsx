import { CheckCircle2 } from "lucide-react";

const PREPARATION = [
  "The project location and building type",
  "The current stage — early idea, concept, tender or on site",
  "The priorities and constraints you already know",
  "Any target dates, without treating them as confirmed availability",
];

export function BriefAside({ responseWindow }: { responseWindow?: string }) {
  return (
    <aside className="space-y-8">
      <div>
        <h2 className="display text-2xl text-ink">Useful to include</h2>
        <ul className="mt-4 space-y-3">
          {PREPARATION.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-sm leading-6 text-muted"
            >
              <CheckCircle2
                aria-hidden
                className="mt-1 size-4 shrink-0 text-forest"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {responseWindow ? (
        <div className="rounded-2xl bg-forest p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-soft">
            Response target
          </p>
          <p className="mt-2 text-lg font-semibold">{responseWindow}</p>
          <p className="mt-2 text-sm leading-6 text-white/65">
            The target starts when the enquiry is received. It is not a promise
            that the project can be delivered in a particular period.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold text-ink">What happens next</h2>
        <ol className="mt-3 space-y-2 text-sm leading-6 text-muted">
          <li>1. The enquiry is stored and routed to the right team.</li>
          <li>2. The team reviews the scope and may ask for clarification.</li>
          <li>3. If it fits, a site or project conversation is arranged.</li>
          <li>
            4. Any proposal, price or programme is confirmed separately in
            writing.
          </li>
        </ol>
      </div>

      <p className="text-xs leading-5 text-muted">
        This form does not accept file uploads yet. If drawings or documents are
        essential, mention that in the brief and wait for the team to provide a
        safe route.
      </p>
    </aside>
  );
}
