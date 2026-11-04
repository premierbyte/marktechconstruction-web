export function GallerySkeleton({ count = 9 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading gallery"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-line bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-mist" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-mist" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-mist" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading gallery images…</span>
    </div>
  );
}