import { ChevronDown } from "lucide-react";
import type { Faq } from "@/features/content";

export function FaqGroup({
  category,
  items,
}: {
  category: string;
  items: Faq[];
}) {
  return (
    <section aria-labelledby={`faq-${category}`}>
      <h2 id={`faq-${category}`} className="display text-2xl text-ink">
        {category}
      </h2>
      <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
        {items.map((faq) => (
          <details key={faq.slug} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
              {faq.question}
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-clay transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
