import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Insight } from "../../types";

function InsightCard({
  insight,
  featured = false,
}: {
  insight: Insight;
  featured?: boolean;
}) {
  const media = insight.media;
  const date = formatDate(insight.published_on);

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-line bg-forest p-6 text-white transition-shadow hover:shadow-lift",
        featured ? "min-h-[24rem] md:col-span-2 lg:col-span-2" : "min-h-[20rem]",
      )}
    >
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt || ""}
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-forest via-forest-soft to-clay/70"
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/55 to-clay/25"
        aria-hidden
      />
      <Link
        href={`/insights/${insight.slug}`}
        className="absolute inset-0 z-10"
        aria-label={insight.title}
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-clay-soft">
          <span>Insight</span>
          {date ? <span className="text-white/50">· {date}</span> : null}
        </div>
        <h2
          className={cn(
            "display mt-2 leading-tight text-white",
            featured ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {insight.title}
        </h2>
        {insight.summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/80">
            {insight.summary}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition-colors group-hover:text-clay-soft">
          Read insight
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  );
}

export function InsightsGrid({
  insights,
  featuredFirst = true,
}: {
  insights: Insight[];
  featuredFirst?: boolean;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, index) => (
        <InsightCard
          key={insight.slug}
          insight={insight}
          featured={featuredFirst && index === 0}
        />
      ))}
    </div>
  );
}